# OPay Webhook Server Deployment Guide

This guide explains how to deploy the OPay webhook server to handle automatic payment verification.

## Prerequisites

1. Node.js installed on your server
2. Firebase service account key
3. OPay merchant credentials
4. Publicly accessible server (or tunneling service like ngrok for testing)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install express firebase-admin
```

### 2. Firebase Service Account Setup

1. Go to Firebase Console →