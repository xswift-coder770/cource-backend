import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { sendDownloadEmail } from '../utils/emailService.js';

const router = express.Router();

/**
 * POST /api/payments/verify
 * Verify payment signature after Razorpay checkout
 */
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment details'
      });
    }

    // Validate Razorpay secret key is configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment verification service is not configured'
      });
    }

    // Find order in database
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent duplicate payment verification
    if (order.status === 'completed' && order.razorpayPaymentId === razorpay_payment_id) {
      console.log(`Payment already verified for order: ${razorpay_order_id}`);
      return res.json({
        success: true,
        message: 'Payment already verified',
        downloadToken: order.downloadToken
      });
    }

    // Verify Razorpay signature (HMAC SHA256)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error(`Invalid signature for order: ${razorpay_order_id}`);
      // Mark order as failed for security tracking
      order.status = 'failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.'
      });
    }

    // Update order with payment details (only if not already completed)
    if (order.status !== 'completed') {
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.status = 'completed';
      await order.save();
      console.log(`✅ Payment verified successfully for order: ${razorpay_order_id}`);
    }

    // Send email with download link
    try {
      const downloadUrl = `${process.env.FRONTEND_URL}/download?token=${order.downloadToken}`;
      await sendDownloadEmail(order.customerEmail, order.customerName, downloadUrl);
      
      order.emailSent = true;
      order.emailSentAt = new Date();
      await order.save();
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the payment if email fails
    }

    // Return success with download token
    res.json({
      success: true,
      message: 'Payment verified successfully',
      downloadToken: order.downloadToken
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook endpoint for payment confirmation
 * This is called by Razorpay server after payment
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    // Verify webhook signature
    const text = req.body.toString();
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== webhookSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body);

    // Handle payment.paid event
    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      // Find and update order
      const order = await Order.findOne({ razorpayOrderId: orderId });

      if (order && order.status === 'pending') {
        order.razorpayPaymentId = payment.id;
        order.status = 'completed';
        await order.save();

        // Send email if not already sent
        if (!order.emailSent) {
          try {
            const downloadUrl = `${process.env.FRONTEND_URL}/download?token=${order.downloadToken}`;
            await sendDownloadEmail(order.customerEmail, order.customerName, downloadUrl);
            
            order.emailSent = true;
            order.emailSentAt = new Date();
            await order.save();
          } catch (emailError) {
            console.error('Error sending email via webhook:', emailError);
          }
        }
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
