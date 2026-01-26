// import express from 'express';
// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import Order from '../models/Order.js';
// import { body, validationResult } from 'express-validator';
// import { getProductById } from '../config/products.js';

// const router = express.Router();

// // Initialize Razorpay safely so local dev doesn't crash without keys.
 
// if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
//   razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
// }

// /**
//  * POST /api/orders/create
//  * Create a new order and Razorpay order
//  * Customer provides: phone (mandatory), productId (optional), couponCode (optional)
//  * Name and email are intentionally not required - only phone is used as user input.
//  */
// router.post('/create', [
//   body('phone').trim().notEmpty().withMessage('Phone number is required'),
//   body('productId').optional().isString().trim(),
//   body('couponCode').optional().isString().trim(),
// ], async (req, res) => {
//   try {
//     // Validate Razorpay is configured
//     if (!razorpay) {
//       console.error('Razorpay not initialized - missing API keys');
//       return res.status(503).json({
//         success: false,
//         message: 'Payment gateway is not configured yet. Please try again later.',
//       });
//     }

//     // Validate environment variables
//     if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//       console.error('Razorpay credentials missing in environment');
//       return res.status(500).json({
//         success: false,
//         message: 'Payment gateway configuration error'
//       });
//     }
//     // Validate input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         errors: errors.array()
//       });
//     }

//     const { phone, productId, couponCode } = req.body;

//     // Resolve product (supports multiple products in future)
//     const product = getProductById(productId);

//     // Coupon logic is strictly backend-only
//     const VALID_COUPON = product.couponCode;
//     const requestedCoupon = (couponCode || '').trim();
//     const isCouponValid = requestedCoupon && requestedCoupon === VALID_COUPON;

//     const basePrice = product.sellingPrice;
//     const discount = isCouponValid ? product.couponDiscount : 0;
//     const finalPrice = basePrice - discount;

//     // Convert rupees to paise for Razorpay
//     const amountInPaise = finalPrice * 100;

//     // Create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: amountInPaise,
//       currency: 'INR',
//       receipt: `order_${Date.now()}`,
//       notes: {
//         customer_phone: phone,
//         product_id: product.productId,
//         product_title: product.title,
//         coupon_code: requestedCoupon || undefined,
//       }
//     });

//     // Generate secure random token for download
//     const downloadToken = crypto.randomBytes(32).toString('hex');
    
//     // Calculate expiration (24 hours from now)
//     const expiresAt = new Date();
//     expiresAt.setHours(expiresAt.getHours() + 24);

//     // Create order in database
//     const order = new Order({
//       // Minimal customer info - we only truly rely on phone
//       customerName: 'Guest Customer',
//       customerEmail: `no-email-${phone}@no-email.local`,
//       customerPhone: phone,

//       razorpayOrderId: razorpayOrder.id,

//       // Store both original and final amounts (in rupees)
//       amount: finalPrice,
//       originalPrice: product.originalPrice,
//       sellingPrice: product.sellingPrice,
//       finalPrice,
//       couponCodeUsed: isCouponValid ? requestedCoupon : null,
//       couponDiscountApplied: discount,

//       // Product linkage
//       productId: product.productId,
//       productTitle: product.title,

//       // Download security
//       downloadToken: downloadToken,
//       expiresAt: expiresAt,
//       status: 'pending'
//     });

//     await order.save();

//     // Return Razorpay order details and pricing to frontend
//     res.json({
//       success: true,
//       order: {
//         id: razorpayOrder.id,
//         amount: razorpayOrder.amount,
//         currency: razorpayOrder.currency,
//         key: process.env.RAZORPAY_KEY_ID, // Frontend needs this
//       },
//       orderId: order._id, // Our database order ID
//       pricing: {
//         productId: product.productId,
//         title: product.title,
//         description: product.description,
//         originalPrice: product.originalPrice,
//         sellingPrice: product.sellingPrice,
//         finalPrice,
//         couponApplied: isCouponValid,
//         couponDiscount: discount,
//       }
//     });

//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to create order',
//       error: error.message 
//     });
//   }
// });

// export default router;




import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { body, validationResult } from 'express-validator';
import { getProductById, getPackagePrice, validateCouponForPackage } from '../config/products.js';

const router = express.Router();

/* --------------------------------------------------
   Helper: get Razorpay instance (SAFE)
-------------------------------------------------- */
function getRazorpayInstance() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
}
/* --------------------------------------------------
   POST /api/orders/create
-------------------------------------------------- */
router.post(
  '/create',
  [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('collegeName').trim().notEmpty().withMessage('College name is required'),
    body('packageType').isIn(['1', '2', '3', '5']).withMessage('Invalid package type'),
    body('couponCode').optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      // ✅ Initialize Razorpay here (env is guaranteed)
      const razorpay = getRazorpayInstance();

      if (!razorpay) {
        console.error(' Razorpay keys missing at runtime');
        return res.status(503).json({
          success: false,
          message: 'Payment service unavailable. Please try again later.',
        });
      }

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { phone, collegeName, packageType, couponCode } = req.body;

      // Get package pricing from backend (NEVER trust frontend)
      const packageInfo = getPackagePrice(packageType);
      if (!packageInfo) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package selected',
        });
      }

      // Validate coupon ONLY for package 5
      const appliedCoupon = (couponCode || '').trim();
      let isCouponValid = false;
      let discount = 0;

      if (appliedCoupon) {
        // Only allow coupon for package 5
        if (packageType !== '5') {
          return res.status(400).json({
            success: false,
            message: 'Coupon codes are only valid for the 5-PDF package',
          });
        }
        isCouponValid = validateCouponForPackage(packageType, appliedCoupon);
        discount = isCouponValid ? packageInfo.couponDiscount : 0;
      }

      // Calculate final price (backend-controlled)
      const basePrice = packageInfo.price;
      const finalPrice = Math.max(0, basePrice - discount);

      if (finalPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment amount',
        });
      }

      const amountInPaise = Math.round(finalPrice * 100);

      // Get default product for metadata
      const product = getProductById();

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          phone,
          college_name: collegeName,
          package_type: packageType,
          pdf_count: packageInfo.pdfCount.toString(),
        },
      });

      // Create local order
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const order = await Order.create({
        customerName: 'Guest Customer',
        customerEmail: `no-email-${phone}@no-email.local`,
        customerPhone: phone,
        collegeName: collegeName,

        razorpayOrderId: razorpayOrder.id,

        amount: finalPrice,
        originalPrice: 475, // Keep for compatibility
        sellingPrice: basePrice,
        finalPrice,

        couponCodeUsed: isCouponValid ? appliedCoupon : null,
        couponDiscountApplied: discount,

        packageType: packageType,
        pdfCount: packageInfo.pdfCount,

        productId: product.productId,
        productTitle: `${packageInfo.title} - ${packageInfo.pdfCount} PDF${packageInfo.pdfCount > 1 ? 's' : ''}`,

        downloadToken,
        expiresAt,
        status: 'pending',
      });

      return res.json({
        success: true,
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
        orderId: order._id,
        pricing: {
          packageType: packageType,
          pdfCount: packageInfo.pdfCount,
          basePrice: basePrice,
          finalPrice: finalPrice,
          couponApplied: isCouponValid,
          couponDiscount: discount,
        },
      });
    } catch (err) {
      console.error(' Error creating order:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
      });
    }
  }
);

export default router;


