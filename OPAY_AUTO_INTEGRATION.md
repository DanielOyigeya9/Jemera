# OPay Automatic Payment Integration Guide

This guide explains how to set up automatic payment verification with OPay for your JEMRA catering course platform.

## Prerequisites

1. OPay Business Account
2. Merchant ID and API Keys from OPay
3. Server with ability to receive webhooks (publicly accessible endpoint)
4. Firebase Realtime Database configured

## Components Needed

### 1. Server-Side Webhook Handler

Create a server endpoint that OPay can call when payments are completed:

```javascript
// Example Node.js Express endpoint
app.post('/opay-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const signature = req.headers['opay-signature'];
  const payload = req.body;
  
  // Verify webhook signature for security
  if (!verifyOpaySignature(payload, signature)) {
    return res.status(401).send('Unauthorized');
  }
  
  try {
    const event = JSON.parse(payload);
    
    // Check if this is a successful payment
    if (event.eventType === 'SUCCESSFUL_TRANSACTION' && event.payload.status === 'SUCCESS') {
      const transactionId = event.payload.transactionId;
      const userId = event.payload.reference; // Assuming you pass userId as reference
      
      // Update user's payment status in Firebase
      await firebase.database().ref('users/' + userId).update({
        paymentStatus: 'paid',
        paymentVerifiedAt: new Date().toISOString(),
        transactionDetails: event.payload
      });
      
      console.log(`Payment verified for user ${userId}, transaction ${transactionId}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
});
```

### 2. OPay Integration Configuration

Update your `assets/js/opay.js` with your merchant credentials:

```javascript
const OPayConfig = {
  merchantId: 'YOUR_MERCHANT_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
  secretKey: 'YOUR_SECRET_KEY',
  baseUrl: 'https://api.opayweb.com' // Production URL
  // For testing: 'https://sandbox.api.opayweb.com'
};

class OPayIntegration {
  static async initPayment(amount, userEmail, userPhone, userName, userId) {
    try {
      // Prepare payment data
      const paymentData = {
        merchantId: OPayConfig.merchantId,
        amount: amount,
        currency: 'NGN',
        reference: userId, // Pass user ID as reference
        customerEmail: userEmail,
        customerPhone: userPhone,
        customerName: userName,
        callbackUrl: window.location.origin + '/payment-success.html',
        cancelUrl: window.location.origin + '/course.html',
        webhookUrl: 'YOUR_SERVER_URL/opay-webhook' // Your webhook endpoint
      };
      
      // Make API call to initialize payment
      const response = await fetch(OPayConfig.baseUrl + '/api/v1/pay/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPayConfig.publicKey
        },
        body: JSON.stringify(paymentData)
      });
      
      const result = await response.json();
      
      if (result.code === '00000') {
        return {
          success: true,
          paymentUrl: result.data.paymentUrl,
          transactionId: result.data.transactionId
        };
      } else {
        return {
          success: false,
          error: result.message
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### 3. Client-Side Payment Flow

The client-side flow is already implemented in your `course.html`. When a user clicks the payment button:

1. Payment is initialized with OPay
2. User is redirected to OPay checkout page
3. After payment, OPay calls your webhook endpoint
4. Your server updates the user's payment status in Firebase
5. The course dashboard automatically detects the payment and unlocks content

### 4. Security Considerations

1. Always verify webhook signatures to ensure requests come from OPay
2. Use HTTPS for all endpoints
3. Store API keys securely (environment variables, not in client code)
4. Implement rate limiting on webhook endpoints
5. Log all payment events for auditing

### 5. Testing

1. Use OPay's sandbox environment for testing
2. Test both successful and failed payment scenarios
3. Verify webhook delivery and processing
4. Test automatic content unlocking in the dashboard

## Implementation Steps

1. Set up your server webhook endpoint
2. Configure OPay merchant credentials in `opay.js`
3. Deploy your webhook endpoint to a publicly accessible URL
4. Update the webhook URL in the payment initialization code
5. Test the complete flow with sandbox transactions
6. Switch to production mode when ready

## Support

For issues with OPay integration:
- Check OPay developer documentation: https://doc.opayweb.com/
- Verify webhook delivery in OPay merchant dashboard
- Ensure your server can receive POST requests from OPay IPs