# 🚀 Backend Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Environment Variables

Create `.env` file in `server/` directory with:

```env
# Required
MONGODB_URI=your_mongodb_atlas_connection_string
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
FRONTEND_URL=https://your-frontend.vercel.app

# Optional
PORT=5000
NODE_ENV=production
```

### ✅ 2. MongoDB Atlas Setup

- [ ] Create MongoDB Atlas account
- [ ] Create a cluster
- [ ] Create database user
- [ ] Whitelist your server IP (or use 0.0.0.0/0 for cloud hosting)
- [ ] Get connection string
- [ ] Add connection string to `.env`

### ✅ 3. Razorpay Setup

- [ ] Log in to Razorpay Dashboard
- [ ] Go to Settings → API Keys
- [ ] Copy **Live Key ID** and **Live Secret Key**
- [ ] Add to `.env` file
- [ ] (Optional) Set up webhook URL in Razorpay dashboard

### ✅ 4. PDF File Setup

- [ ] Place your PDF file in `server/uploads/` folder
- [ ] Name it: `product-default.pdf` (or update `config/products.js`)
- [ ] Verify file is readable and not corrupted

### ✅ 5. Test Locally

```bash
cd server
npm install
npm run dev
```

- [ ] Check `/api/health` endpoint works
- [ ] Verify MongoDB connection
- [ ] Test order creation
- [ ] Test payment verification (use Razorpay test mode)

## Deployment Steps

### Option A: Railway (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**
   - Go to Project → Variables
   - Add all variables from `.env.example`

4. **Deploy**
   - Railway auto-detects Node.js
   - Deploys automatically on git push

5. **Add PDF File**
   - Use Railway's file system or
   - Upload to cloud storage (S3/Cloudinary) and update code

### Option B: Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repo
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all required variables

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy

### Option C: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login & Create App**
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your_uri
   heroku config:set RAZORPAY_KEY_ID=your_key
   heroku config:set RAZORPAY_KEY_SECRET=your_secret
   heroku config:set FRONTEND_URL=your_frontend_url
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## Post-Deployment Verification

### ✅ 1. Health Check

Visit: `https://your-backend-url.com/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "razorpay": "configured"
}
```

### ✅ 2. Test Payment Flow

1. **Create Order**
   - Frontend calls: `POST /api/orders/create`
   - Should return Razorpay order details

2. **Complete Payment**
   - Use Razorpay test mode
   - Complete payment in checkout

3. **Verify Payment**
   - Frontend calls: `POST /api/payments/verify`
   - Should return download token

4. **Download PDF**
   - Frontend calls: `GET /api/download/:token`
   - Should download PDF file

### ✅ 3. Security Checks

- [ ] PDF is NOT accessible via direct URL
- [ ] Unpaid orders cannot download
- [ ] Expired tokens are rejected
- [ ] Invalid signatures are rejected
- [ ] Duplicate payments are handled

## Production Checklist

- [ ] All environment variables set
- [ ] MongoDB connection working
- [ ] Razorpay keys are LIVE keys (not test)
- [ ] PDF file uploaded and accessible
- [ ] Frontend URL updated in `.env`
- [ ] Health check endpoint working
- [ ] Payment flow tested end-to-end
- [ ] Error handling tested
- [ ] Logs are being monitored
- [ ] Backup strategy in place

## Troubleshooting

### MongoDB Connection Failed
- Check connection string format
- Verify IP whitelist in MongoDB Atlas
- Check database user permissions

### Razorpay Errors
- Verify you're using LIVE keys (not test)
- Check key format is correct
- Ensure webhook URL is correct (if using)

### PDF Not Found
- Verify file exists in `uploads/` folder
- Check filename matches `secureFileName` in config
- Ensure file permissions allow reading

### Payment Verification Fails
- Check Razorpay signature verification
- Verify order exists in database
- Check payment status in Razorpay dashboard

## Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test with Razorpay test mode first
4. Check MongoDB connection
5. Review error messages in API responses
