// OPay integration for JEMRA website

// Initialize OPay payment
async function initOPayPayment(amount, userEmail, userPhone, userName, userId) {
  try {
    // In a real implementation, you would make an API call to your backend
    // which would then call OPay's API to create a payment transaction
    
    // For demo purposes, we'll simulate the process
    console.log('Initializing OPay payment:', { amount, userEmail, userPhone, userName, userId });
    
    // Simulate API call to backend
    const response = await simulateOPayAPI(amount, userEmail, userPhone, userName);
    
    if (response.success) {
      // Track payment in Firebase
      await trackOPayPayment(userId, response.transactionId, amount);
      
      // Return payment URL or QR code data
      return {
        success: true,
        paymentUrl: response.paymentUrl,
        transactionId: response.transactionId,
        message: 'Payment initialized successfully'
      };
    } else {
      throw new Error(response.message || 'Failed to initialize payment');
    }
  } catch (error) {
    console.error('OPay payment initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Simulate OPay API call (in real implementation, this would be a backend call)
async function simulateOPayAPI(amount, userEmail, userPhone, userName) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a mock transaction ID
  const transactionId = 'OPAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Return mock response
  return {
    success: true,
    transactionId: transactionId,
    paymentUrl: `https://opay.com/pay/${transactionId}`,
    message: 'Transaction created successfully'
  };
}

// Track OPay payment in Firebase Realtime Database
async function trackOPayPayment(userId, transactionId, amount) {
  try {
    // Create a payment record in Realtime Database
    const paymentRef = firebase.database().ref('payments').push();
    await paymentRef.set({
      userId: userId,
      transactionId: transactionId,
      amount: amount,
      currency: 'NGN',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Update user's payment status
    await firebase.database().ref('users/' + userId).update({
      paymentStatus: 'pending',
      currentTransactionId: transactionId,
      updatedAt: new Date().toISOString()
    });
    
    console.log('Payment tracked successfully:', paymentRef.key);
    return { success: true, paymentId: paymentRef.key };
  } catch (error) {
    console.error('Error tracking payment:', error);
    return { success: false, error: error.message };
  }
}

// Check payment status
async function checkPaymentStatus(transactionId) {
  try {
    // In a real implementation, you would call OPay's API to check status
    // For demo, we'll simulate a successful payment after some time
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful payment
    return {
      success: true,
      status: 'successful',
      message: 'Payment completed successfully'
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update payment status in Firebase Realtime Database
async function updatePaymentStatus(transactionId, status) {
  try {
    // Find payment record by transaction ID
    const paymentsRef = firebase.database().ref('payments');
    const paymentsSnapshot = await paymentsRef.orderByChild('transactionId').equalTo(transactionId).once('value');
    
    if (paymentsSnapshot.exists()) {
      const paymentsData = paymentsSnapshot.val();
      let paymentKey = null;
      let paymentData = null;
      
      // Get the first matching payment
      for (const key in paymentsData) {
        paymentKey = key;
        paymentData = paymentsData[key];
        break;
      }
      
      if (paymentKey && paymentData) {
        // Update payment status
        await firebase.database().ref('payments/' + paymentKey).update({
          status: status,
          updatedAt: new Date().toISOString()
        });
        
        // Update user's payment status
        await firebase.database().ref('users/' + paymentData.userId).update({
          paymentStatus: status === 'successful' ? 'paid' : status,
          updatedAt: new Date().toISOString()
        });
        
        console.log('Payment status updated successfully:', transactionId, status);
        return { success: true };
      } else {
        throw new Error('Payment data not found');
      }
    } else {
      throw new Error('Payment record not found');
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error: error.message };
  }
}

// Handle OPay webhook (this would typically be a backend endpoint)
async function handleOPayWebhook(webhookData) {
  try {
    console.log('Received OPay webhook:', webhookData);
    
    // Verify webhook signature (in real implementation)
    // const isValid = verifyWebhookSignature(webhookData);
    // if (!isValid) {
    //   throw new Error('Invalid webhook signature');
    // }
    
    // Extract relevant data
    const { transactionId, status, amount } = webhookData;
    
    // Update payment status in Firebase
    await updatePaymentStatus(transactionId, status);
    
    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('Error processing OPay webhook:', error);
    return { success: false, error: error.message };
  }
}

// Export functions for use in other files
window.OPayIntegration = {
  initPayment: initOPayPayment,
  checkStatus: checkPaymentStatus,
  handleWebhook: handleOPayWebhook
};