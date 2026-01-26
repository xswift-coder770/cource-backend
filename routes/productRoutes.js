import express from 'express';
import { PRODUCTS, PACKAGE_PRICING } from '../config/products.js';

const router = express.Router();

/**
 * GET /api/products
 * Public endpoint to fetch product metadata and package pricing for the frontend.
 * Does NOT expose any secure file paths or coupon codes.
 */
router.get('/', (req, res) => {
  const safeProducts = PRODUCTS.map((p) => ({
    productId: p.productId,
    title: p.title,
    description: p.description,
    originalPrice: p.originalPrice,
    sellingPrice: p.sellingPrice,
  }));

  // Return package information (prices are backend-controlled, this is just for display)
  const packages = Object.keys(PACKAGE_PRICING).map(key => {
    const pkg = PACKAGE_PRICING[key];
    return {
      packageType: key,
      pdfCount: pkg.pdfCount,
      price: pkg.price,
      title: pkg.title,
      emailCount: pkg.emailCount, // Number of HR emails in the PDF
      supportsCoupon: key === '5' // Only package 5 supports coupons
    };
  });

  res.json({
    success: true,
    products: safeProducts,
    packages: packages,
  });
});

export default router;

