// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import orderRoutes from './routes/orderRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
// import downloadRoutes from './routes/downloadRoutes.js';
// import productRoutes from './routes/productRoutes.js';
// import { verifyStartup } from './utils/startupCheck.js';

// // Load environment variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Validate critical environment variables
// const requiredEnvVars = ['MONGODB_URI', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
// const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// if (missingEnvVars.length > 0) {
//   console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
//   console.error('Please check your .env file and ensure all required variables are set.');
//   // Don't exit in development, but warn heavily
//   if (process.env.NODE_ENV === 'production') {
//     process.exit(1);
//   }
// }


// // Connect to MongoDB
// const mongoUri = process.env.MONGODB_URI;
// if (!mongoUri) {
//   console.error('❌ MONGODB_URI is not set. Cannot connect to database.');
//   process.exit(1);
// }

// mongoose.connect(mongoUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => {
//   console.log('✅ MongoDB connected successfully');
//   console.log(`📊 Database: ${mongoUri.split('@')[1]?.split('/')[1] || 'connected'}`);
// })
// .catch((err) => {
//   console.error('❌ MongoDB connection error:', err.message);
//   if (process.env.NODE_ENV === 'production') {
//     process.exit(1);
//   }
// });

// // Routes
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/download', downloadRoutes);

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   const healthStatus = {
//     status: 'OK',
//     message: 'Server is running',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development',
//     database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured'
//   };
//   res.json(healthStatus);
// });

// // 404 handler for undefined routes
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { error: err.message })
//   });
// });

// // Verify startup requirements
// const startupOk = verifyStartup();

// // Start server
// const PORT = process.env.PORT || 5000;

// if (startupOk || process.env.NODE_ENV !== 'production') {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
//     console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured'}`);
//     console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
//   });
// } else {
//   console.error('\n❌ Server startup aborted due to critical issues.\n');
//   process.exit(1);
// }




// server ko wakeup rakhna ke liye ye use kar rhe hai new wala 



import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import downloadRoutes from './routes/downloadRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { verifyStartup } from './utils/startupCheck.js';

// Load environment variables
dotenv.config();

const app = express();

/* =========================
   Middleware
========================= */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Validate environment variables
========================= */
const requiredEnvVars = [
  'MONGODB_URI',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

/* =========================
   MongoDB connection
========================= */
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set.');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/* =========================
   Routes
========================= */
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/download', downloadRoutes);

/* =========================
   Health check
========================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not configured'
  });
});

/* =========================
   🔥 Ping endpoint (IMPORTANT)
   Used by UptimeRobot to keep Render awake
========================= */
app.get('/api/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, ts: Date.now() });
});

/* =========================
   404 handler
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* =========================
   Global error handler
========================= */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

/* =========================
   Start server
========================= */
const startupOk = verifyStartup();
const PORT = process.env.PORT || 5000;

if (startupOk || process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
    console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  });

  // Reduce random timeouts on slow cold starts
  server.keepAliveTimeout = 75_000;
  server.headersTimeout = 80_000;
  server.requestTimeout = 120_000;
} else {
  console.error('❌ Server startup aborted.');
  process.exit(1);
}
