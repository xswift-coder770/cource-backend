import mongoose from 'mongoose';
/**
 * Order Schema
 * Stores order information with secure download token and product details
 */
const orderSchema = new mongoose.Schema({
  // Customer Information
  customerName: {
    type: String,
    required: false,
    trim: true
  },
  customerEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  collegeName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Payment Information
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  
  // Order Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },

  // Product Details (supports multiple products in future)
  productId: {
    type: String,
    required: true,
    index: true
  },
  productTitle: {
    type: String,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
    required: true
  },
  finalPrice: {
    // The actual amount charged (after coupon), in rupees
    type: Number,
    required: true
  },
  couponCodeUsed: {
    type: String,
    default: null
  },
  couponDiscountApplied: {
    type: Number,
    default: 0
  },
  
  // Package Information
  packageType: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '5']
  },
  pdfCount: {
    type: Number,
    required: true
  },
  
  // Secure Download Token
  downloadToken: {
    type: String,
    required: true,
    unique: true,
    index: true // Index for faster lookups
  },
  
  // Token Usage Tracking
  tokenUsed: {
    type: Boolean,
    default: false
  },
  tokenUsedAt: {
    type: Date,
    default: null
  },
  
  // Expiration (24 hours from payment)
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Email sent status
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
orderSchema.index({ downloadToken: 1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired orders

// Method to check if token is valid
orderSchema.methods.isTokenValid = function() {
  if (this.tokenUsed) return false;
  if (new Date() > this.expiresAt) return false;
  if (this.status !== 'completed') return false;
  return true;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
