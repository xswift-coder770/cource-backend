# Backend Server - PDF Selling Platform

Production-ready Node.js + Express backend for secure PDF sales with Razorpay integration.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required Variables:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID (from dashboard)
- `RAZORPAY_KEY_SECRET` - Your Razorpay Secret Key
- `FRONTEND_URL` - Your deployed frontend URL (e.g., Vercel)

### 3. Add Your PDF File

Place your PDF file in `server/uploads/` directory:
- Default filename: `product-default.pdf` (as configured in `config/products.js`)
- Or update `secureFileName` in `config/products.js` to match your file

### 4. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## 📁 Project Structure

```
server/
├── config/
│   └── products.js          # Product configuration
├── models/
│   └── Order.js            # MongoDB Order schema
├── routes/
│   ├── orderRoutes.js      # Order creation endpoints
│   ├── paymentRoutes.js    # Payment verification & webhooks
│   ├── downloadRoutes.js   # Secure PDF download
│   └── productRoutes.js    # Product metadata API
├── utils/
│   └── emailService.js     # Email sending (optional)
├── uploads/                # PDF files stored here (NOT public)
├── server.js               # Main server file
└── .env                    # Environment variables (not in git)
```

## 🔒 Security Features

✅ **Razorpay Signature Verification** - HMAC SHA256 verification
✅ **Secure Download Tokens** - Cryptographically secure, one-time use
✅ **Payment Verification** - Backend-only, prevents fraud
✅ **PDF Access Control** - Only paid orders can download
✅ **Token Expiration** - 24-hour validity window
✅ **Duplicate Payment Prevention** - Idempotent verification
✅ **No Public PDF Access** - Files never exposed directly

## 📡 API Endpoints

### Products
- `GET /api/products` - Get product list (public)

### Orders
- `POST /api/orders/create` - Create Razorpay order

### Payments
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/payments/webhook` - Razorpay webhook handler

### Downloads
- `GET /api/download/:token` - Download PDF (requires valid token)
- `GET /api/download/verify/:token` - Check token validity

### Health
- `GET /api/health` - Server health check

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `RAZORPAY_KEY_ID` | ✅ Yes | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | ✅ Yes | Razorpay Secret Key |
| `FRONTEND_URL` | ✅ Yes | Frontend deployment URL |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `RAZORPAY_WEBHOOK_SECRET` | No | Webhook secret (if using) |
| `EMAIL_*` | No | Email config (optional) |

## 🚢 Deployment

### Deploy to Railway / Render / Heroku

1. **Set Environment Variables** in your hosting platform:
   - Add all required variables from `.env.example`

2. **Upload PDF File**:
   - Option A: Use file upload via hosting platform
   - Option B: Use cloud storage (S3, Cloudinary) and update `downloadRoutes.js`

3. **Deploy**:
   ```bash
   git push origin main
   ```

4. **Verify**:
   - Check `/api/health` endpoint
   - Test payment flow with Razorpay test mode

### Using Cloud Storage (Recommended for Production)

For better scalability, store PDFs in cloud storage:

1. Upload PDF to AWS S3 / Cloudinary / Google Cloud Storage
2. Update `downloadRoutes.js` to fetch from cloud storage
3. Keep `server/uploads/` for local development only

## 🧪 Testing

### Test Payment Flow

1. Create order: `POST /api/orders/create`
2. Complete payment in Razorpay test mode
3. Verify payment: `POST /api/payments/verify`
4. Download PDF: `GET /api/download/:token`

### Health Check

```bash
curl https://your-backend-url.com/api/health
```

## 📝 Notes

- **PDF Security**: PDFs in `uploads/` folder are NEVER served as static files
- **Token Security**: Download tokens are 64-character hex strings (2^256 combinations)
- **Payment Verification**: Always happens server-side, never trust frontend alone
- **Webhooks**: Optional but recommended for production reliability

## 🐛 Troubleshooting

**MongoDB Connection Failed:**
- Check `MONGODB_URI` is correct
- Verify network access to MongoDB Atlas
- Check IP whitelist in MongoDB Atlas

**Razorpay Errors:**
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Check if keys are for correct environment (test vs live)
- Ensure webhook URL is configured in Razorpay dashboard

**PDF Not Found:**
- Verify PDF file exists in `server/uploads/`
- Check filename matches `secureFileName` in `config/products.js`
- Ensure file permissions allow reading

## 📄 License

Private - For internal use only
