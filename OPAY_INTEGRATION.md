# OPay Business Account Integration Guide

## Setup Instructions

To connect the OPay business account API for payments, follow these steps:

## 1. Obtain OPay Credentials

1. Sign up for an OPay Business account at [OPay Business Portal](https://business.opayweb.com/)
2. Complete the business verification process
3. Navigate to the Developer/API section
4. Generate the following credentials:
   - Merchant ID
   - Public Key
   - Private Key (keep this secure)

## 2. Configure the Application

1. Open `course.html` in a text editor
2. Locate the OPayIntegration section (around line 700)
3. Replace the placeholder values with your actual credentials:

```javascript
const OPayIntegration = {
    // OPay Business API configuration
    merchantId: 'YOUR_ACTUAL_OPAY_MERCHANT_ID',
    publicKey: 'YOUR_ACTUAL_OPAY_PUBLIC_KEY',
    
    // ... rest of the code
};
```

## 3. Server-Side Webhook Endpoint

Create a server-side endpoint to handle payment confirmations from OPay:

1. Set up a webhook URL in your OPay dashboard pointing to your server
2. Implement a handler that:
   - Verifies the payment with OPay's API
   - Updates the user's payment status in Firestore
   - Generates and sends the course access code to the user's email

Example server-side webhook handler (Node.js):

```javascript
app.post('/opay-webhook', async (req, res) => {
    try {
        // Verify the webhook signature (implementation depends on OPay's documentation)
        const isValid = verifyWebhookSignature(req.headers, req.body);
        
        if (!isValid) {
            return res.status(400).send('Invalid signature');
        }
        
        const { transactionId, status, amount, userEmail } = req.body;
        
        if (status === 'SUCCESS') {
            // Find user by email and update payment status
            const userQuery = await db.collection('users').where('email', '==', userEmail).limit(1).get();
            
            if (!userQuery.empty) {
                const userDoc = userQuery.docs[0];
                await userDoc.ref.update({
                    paymentStatus: 'paid',
                    enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
                    hasAccessCode: false // Will be set to true when user enters code
                });
                
                // Generate course access code
                const courseCode = generateCourseAccessCode(); // Implement this function
                
                // Store the code (associate with user or store separately)
                await db.collection('courseCodes').add({
                    code: courseCode,
                    userId: userDoc.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    used: false
                });
                
                // Send email with course code (implement email sending)
                await sendCourseCodeEmail(userEmail, courseCode);
                
                res.status(200).send('Payment confirmed and code sent');
            } else {
                res.status(404).send('User not found');
            }
        } else {
            res.status(200).send('Payment not successful');
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal server error');
    }
});
```

## 4. Testing

1. Test the payment flow with OPay's sandbox environment first
2. Verify that webhooks are properly received and processed
3. Ensure course codes are generated and emailed correctly
4. Test the course access flow with valid codes

## Security Considerations

1. Never expose your private key in client-side code
2. Always verify webhook signatures
3. Use HTTPS for all payment-related communications
4. Implement proper rate limiting on payment endpoints
5. Log all payment transactions for auditing

## Support

For issues with OPay integration, refer to:
- [OPay Developer Documentation](https://doc.opayweb.com/)
- OPay Business Support