# Firebase Setup Guide for JEMRA Website

This guide explains how to set up Firebase for the JEMRA website to enable real user authentication and admin panel functionality.

## Prerequisites

1. A Google account
2. Access to the JEMRA website files

## Setting Up Firebase

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter "JEMRA Catering" as the project name
4. Accept the terms and conditions
5. Click "Create project"

### 2. Register Your App

1. In the Firebase Console, click "Add app" and select the web icon (</>)
2. Enter "JEMRA Website" as the app nickname
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy the Firebase configuration object (firebaseConfig)

### 3. Update Firebase Configuration

1. Open `assets/js/firebase-config.js`
2. Replace the placeholder values with your actual Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### 4. Enable Authentication

1. In the Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" sign-in provider
3. Optionally enable other providers like Google, Facebook, etc.

### 5. Set Up Cloud Firestore

1. In the Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development) or "Start in locked mode" (for production)
4. Choose a location closest to your users
5. Click "Enable"

### 6. Configure Firestore Security Rules

1. In the Firebase Console, go to "Firestore Database" > "Rules"
2. Replace the default rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read and write their own user document
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Admins can read all user documents
       match /users/{userId} {
         allow read: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
       }
       
       // Payments collection - users can read/write their own payments
       match /payments/{paymentId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
       
       // Admins can read all payments
       match /payments/{paymentId} {
         allow read: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
       }
     }
   }
   ```

### 7. Set Up Admin User

1. Register a new user account through the website
2. In the Firebase Console, go to "Firestore Database" > "Data"
3. Find the user document in the "users" collection
4. Edit the document and add a field:
   - Field name: `isAdmin`
   - Type: boolean
   - Value: `true`

## Testing the Setup

### Method 1: Using the Test Page

1. Open `test-auth.html` in a browser
2. Try registering a new user account
3. Test logging in with the account
4. Verify that authentication works correctly

### Method 2: Using the Main Website

1. Open the website in a browser
2. Click on "Login" or "Register" in the header
3. Try registering a new user account
4. Log in with the account
5. Navigate to the admin panel (admin.html)
6. Verify that non-admin users see the access denied message
7. Log in with the admin account and verify access to the admin panel

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check that all Firebase SDK scripts are loaded correctly
2. **Authentication not working**: Verify Firebase configuration values
3. **Admin panel access denied**: Ensure the user document has `isAdmin: true`
4. **Firestore permissions errors**: Check Firestore security rules

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all configuration values are correct
3. Ensure you're using compatible Firebase SDK versions
4. Consult the [Firebase documentation](https://firebase.google.com/docs)

## Production Considerations

1. Update Firestore security rules for production use
2. Set up proper error handling and logging
3. Implement rate limiting for API calls
4. Use environment variables for sensitive configuration
5. Set up monitoring and alerts for critical functions