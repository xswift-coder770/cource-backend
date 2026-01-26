import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from '../config/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verify server startup requirements
 * Checks for required files, environment variables, etc.
 */
export const verifyStartup = () => {
  const issues = [];
  const warnings = [];

  // Check environment variables
  if (!process.env.MONGODB_URI) {
    issues.push('MONGODB_URI is not set');
  }

  if (!process.env.RAZORPAY_KEY_ID) {
    issues.push('RAZORPAY_KEY_ID is not set');
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    issues.push('RAZORPAY_KEY_SECRET is not set');
  }

  if (!process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL is not set (download links may not work correctly)');
  }

  // Check if PDF files exist
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    warnings.push(`Uploads directory not found: ${uploadsDir}`);
  } else {
    // Check each product's PDF file
    PRODUCTS.forEach(product => {
      if (product.secureFileName) {
        const pdfPath = path.join(uploadsDir, product.secureFileName);
        if (!fs.existsSync(pdfPath)) {
          issues.push(`PDF file not found for product ${product.productId}: ${pdfPath}`);
        } else {
          const stats = fs.statSync(pdfPath);
          if (stats.size === 0) {
            warnings.push(`PDF file is empty: ${pdfPath}`);
          }
        }
      }
    });
  }

  // Report issues
  if (issues.length > 0) {
    console.error('\n❌ CRITICAL ISSUES FOUND:');
    issues.forEach(issue => console.error(`   - ${issue}`));
    console.error('\nPlease fix these issues before starting the server.\n');
    return false;
  }

  // Report warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
    console.warn('');
  }

  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All startup checks passed!\n');
  }

  return true;
};
