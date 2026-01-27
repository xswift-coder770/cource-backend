// import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';
// import Order from '../models/Order.js';

// const router = express.Router();

// // Get directory name (ES modules)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /**
//  * GET /api/download/:token
//  * Secure download endpoint - validates token and serves PDF
//  */
// router.get('/:token', async (req, res) => {
//   try {
//     const { token } = req.params;

//     if (!token) {
//       return res.status(400).json({
//         success: false,
//         message: 'Download token is required'
//       });
//     }

//     // Find order by token
//     const order = await Order.findOne({ downloadToken: token });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Invalid download link. Link may have expired.'
//       });
//     }

//     // CRITICAL: Only allow downloads for PAID orders
//     if (order.status !== 'completed') {
//       console.warn(`Unauthorized download attempt for unpaid order: ${order._id}, status: ${order.status}`);
//       return res.status(403).json({
//         success: false,
//         message: 'Access denied. Payment not verified for this order.'
//       });
//     }

//     // Check if token is valid (not used, not expired)
//     if (!order.isTokenValid()) {
//       // Mark as expired if not already
//       if (order.status === 'completed') {
//         order.status = 'expired';
//         await order.save();
//       }
      
//       return res.status(403).json({
//         success: false,
//         message: 'Download link has expired or has already been used.'
//       });
//     }

//     // Get PDF file based on package type from order
//     const { PACKAGE_PRICING } = await import('../config/products.js');
//     const packageInfo = PACKAGE_PRICING[order.packageType];
    
//     if (!packageInfo || !packageInfo.secureFileName) {
//       return res.status(403).json({
//         success: false,
//         message: 'Unauthorized access to product file.'
//       });
//     }

//     // Path to PDF file (stored in server/uploads folder)
//     // IMPORTANT: This folder is never exposed as a static directory
//     const pdfPath = path.join(__dirname, '../uploads', packageInfo.secureFileName);

//     // Check if file exists
//     if (!fs.existsSync(pdfPath)) {
//       console.error('PDF file not found at:', pdfPath);
//       return res.status(500).json({
//         success: false,
//         message: 'PDF file not available. Please contact support.'
//       });
//     }

//     // Mark token as used (one-time download) only after we know file exists
//     order.tokenUsed = true;
//     order.tokenUsedAt = new Date();
//     await order.save();

//     // Set headers for file download
//     const fileName = `package${order.packageType}_${packageInfo.emailCount}_emails.pdf`;
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//     res.setHeader('Content-Length', fs.statSync(pdfPath).size);

//     // Stream the file
//     const fileStream = fs.createReadStream(pdfPath);
//     fileStream.pipe(res);

//     // Log download for analytics
//     console.log(`✅ PDF downloaded: Package ${order.packageType} (${packageInfo.emailCount} emails) by: ${order.customerPhone} (Order: ${order._id})`);

//   } catch (error) {
//     console.error('Error downloading PDF:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to download PDF',
//       error: error.message
//     });
//   }
// });

// /**
//  * GET /api/download/verify/:token
//  * Verify if a download token is valid (without downloading)
//  * Used by frontend to check link validity
//  */
// router.get('/verify/:token', async (req, res) => {
//   try {
//     const { token } = req.params;

//     const order = await Order.findOne({ downloadToken: token });

//     if (!order) {
//       return res.json({
//         valid: false,
//         message: 'Invalid download link'
//       });
//     }

//     if (!order.isTokenValid()) {
//       return res.json({
//         valid: false,
//         message: 'Download link has expired or has already been used'
//       });
//     }

//     res.json({
//       valid: true,
//       message: 'Download link is valid'
//     });

//   } catch (error) {
//     console.error('Error verifying token:', error);
//     res.status(500).json({
//       valid: false,
//       message: 'Error verifying token'
//     });
//   }
// });

// export default router;




import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Order from '../models/Order.js';

const router = express.Router();

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * =====================================================
 * GET /api/download/verify/:token
 * Verify download token without downloading the file
 * =====================================================
 */
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.json({
        valid: false,
        message: 'Token missing'
      });
    }

    const order = await Order.findOne({ downloadToken: token });

    if (!order) {
      return res.json({
        valid: false,
        message: 'Invalid download link'
      });
    }

    if (!order.isTokenValid()) {
      return res.json({
        valid: false,
        message: 'Download link has expired or already used'
      });
    }

    return res.json({
      valid: true,
      message: 'Download link is valid'
    });

  } catch (error) {
    console.error('Verify token error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Error verifying token'
    });
  }
});

/**
 * =====================================================
 * GET /api/download/:token
 * Secure PDF download (ONE TIME ONLY)
 * =====================================================
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Download token is required'
      });
    }

    // Find order
    const order = await Order.findOne({ downloadToken: token });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid download link'
      });
    }

    // Payment must be completed
    if (order.status !== 'completed') {
      return res.status(403).json({
        success: false,
        message: 'Payment not verified'
      });
    }

    // Token validity check
    if (!order.isTokenValid()) {
      order.status = 'expired';
      await order.save();

      return res.status(403).json({
        success: false,
        message: 'Download link expired or already used'
      });
    }

    // Get package info
    const { PACKAGE_PRICING } = await import('../config/products.js');
    const packageInfo = PACKAGE_PRICING[order.packageType];

    if (!packageInfo || !packageInfo.secureFileName) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized product access'
      });
    }

    // PDF path
    const pdfPath = path.join(__dirname, '../uploads', packageInfo.secureFileName);

    if (!fs.existsSync(pdfPath)) {
      console.error('PDF missing:', pdfPath);
      return res.status(500).json({
        success: false,
        message: 'PDF file not found on server'
      });
    }

    // Mark token as used (ONE TIME)
    order.tokenUsed = true;
    order.tokenUsedAt = new Date();
    await order.save();

    // Download headers
    const fileName = `package_${order.packageType}_${packageInfo.emailCount}_emails.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fs.statSync(pdfPath).size);

    // Stream PDF
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res);

    console.log(
      `✅ PDF downloaded | Package ${order.packageType} | Order ${order._id}`
    );

  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
});

export default router;











