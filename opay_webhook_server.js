// Simple Node.js server for handling OPay webhooks
// This is an example implementation - you'll need to deploy this to a server

const express = require('express');
const admin = require('firebase-admin');
const crypto = require('crypto');

const app = express();

// Middleware to capture raw body for signature verification
app.use('/opay-webhook', express.raw({type: 'application/json'}));

// Parse JSON for other routes
app.use(express.json());

// Initialize Firebase Admin SDK
// You'll need to download your Firebase service account key and place it in the project
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bandix-1bd74-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// OPay webhook endpoint
app.post('/opay-webhook', async (req, res) => {
  try {
    // Get the raw body and signature
    const payload = req.body;
    const signature = req.headers['opay-signature'];
    
    // Verify the webhook signature (you'll need your OPay secret key)
    // Uncomment and configure this in production:
    /*
    if (!verifyWebhookSignature(payload, signature)) {
      console.log('Invalid webhook signature');
      return res.status(401).send('Unauthorized');
    }
    */
    
    // Parse the payload
    const eventData = JSON.parse(payload.toString());
    console.log('Received OPay webhook:', eventData);
    
    // Process the event based on type
    if (eventData.eventType === 'SUCCESSFUL_TRANSACTION') {
      const transaction = eventData.payload;
      
      // Extract relevant data
      const transactionId = transaction.transactionId;
      const userId = transaction.reference; // Assuming you pass userId as reference
      const amount = transaction.amount;
      const status = transaction.status;
      
      // Update payment status in Firebase
      await updatePaymentStatus(transactionId, userId, status, transaction);
      
      console.log(`Payment ${status} for user ${userId}, transaction ${transactionId}`);
    }
    
    // Respond to OPay
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Update payment status in Firebase
async function updatePaymentStatus(transactionId, userId, status, transactionData) {
  try {
    // Update user's payment status
    await db.ref('users/' + userId).update({
      paymentStatus: status === 'SUCCESS' ? 'paid' : status.toLowerCase(),
      paymentVerifiedAt: new Date().toISOString(),
      transactionDetails: transactionData
    });
    
    // Log the transaction
    await db.ref('payment_logs').push({
      userId: userId,
      transactionId: transactionId,
      status: status,
      timestamp: new Date().toISOString(),
      transactionData: transactionData
    });
    
    console.log(`Payment status updated for user ${userId}`);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Verify OPay webhook signature
function verifyWebhookSignature(payload, signature) {
  // You'll need your OPay secret key
  const secretKey = process.env.OPAY_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('OPAY_SECRET_KEY not configured');
    return true; // Skip verification in development
  }
  
  // Create HMAC signature
  const expectedSignature = crypto
    .createHmac('sha512', secretKey)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OPay webhook server running on port ${PORT}`);
});

module.exports = app;