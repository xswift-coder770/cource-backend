// // Central product configuration for the PDF store.
// // Package-based pricing system

// // Package pricing configuration (backend-controlled)
// export const PACKAGE_PRICING = {
//   '1': { 
//     pdfCount: 1, 
//     price: 30,  //30
//     title: 'Single PDF Package',
//     secureFileName: 'package1.pdf', // PDF with 500 HR emails
//     emailCount: 500
//   },
//   '2': { 
//     pdfCount: 2, 
//     price: 50, //50
//     title: 'Double PDF Package',
//     secureFileName: 'package2.pdf', // PDF with 1000 HR emails
//     emailCount: 1000
//   },
//   '3': { 
//     pdfCount: 3, 
//     price: 65, //65
//     title: 'Triple PDF Package',
//     secureFileName: 'package3.pdf', // PDF with 1500 HR emails
//     emailCount: 1500
//   },
//   '5': { 
//     pdfCount: 5, 
//     price: 79, //79
//     title: 'Premium PDF Package',
//     secureFileName: 'package4.pdf', // PDF with 2500 HR emails
//     emailCount: 2500,
//     couponCode: 'HELLOBIT', 
//     couponDiscount: 20 
//   }
// };

// export const PRODUCTS = [
//   {
//     productId: 'DEFAULT_PDF_1',
//     title: 'Professional Outreach & Communication Learning Guide',
//     description:
//       'An educational PDF resource containing learning frameworks, example templates, and case studies for professional networking and business communication. All content is for educational purposes only, based on publicly available information.',
//     originalPrice: 475,
//     sellingPrice: 75,
//     // Server-side only: never sent to the client
//     secureFileName: 'product-default.pdf',
//   },
// ];

// export const getProductById = (productId) => {
//   if (!productId) return PRODUCTS[0];
//   return PRODUCTS.find((p) => p.productId === productId) || PRODUCTS[0];
// };

// // Get package pricing (backend-only, never trust frontend)
// export const getPackagePrice = (packageType) => {
//   return PACKAGE_PRICING[packageType] || null;
// };

// // Validate coupon for specific package
// export const validateCouponForPackage = (packageType, couponCode) => {
//   const packageInfo = PACKAGE_PRICING[packageType];
//   if (!packageInfo) return false;
  
//   // Only package 5 supports coupons
//   if (packageType !== '5') return false;
  
//   const appliedCoupon = (couponCode || '').trim();
//   return appliedCoupon && appliedCoupon === packageInfo.couponCode;
// };







// Central product configuration for the PDF store.
// Package-based pricing system
// Package pricing configuration (backend-controlled)
export const PACKAGE_PRICING = {
  '1': { 
    pdfCount: 1, 
    price: 30,  //30
    title: 'Single PDF Package',
    secureFileName: 'package1.pdf', // PDF with 500 HR emails
    emailCount: 500
  },
  '2': { 
    pdfCount: 2, 
    price: 50, //50
    title: 'Double PDF Package',
    secureFileName: 'package2.pdf', // PDF with 1000 HR emails
    emailCount: 1000
  },
  '3': { 
    pdfCount: 3, 
    price: 65, //65
    title: 'Triple PDF Package',
    secureFileName: 'package3.pdf', // PDF with 1500 HR emails
    emailCount: 1500
  },
  '5': { 
    pdfCount: 5, 
    price: 79, //79
    title: 'Premium PDF Package',
    secureFileName: 'package4.pdf', // PDF with 2500 HR emails
    emailCount: 2500,
    couponCode: 'ARYAN', 
    couponDiscount: 50,
    // Secret coupon for specific people
    secretCouponCode: 'ARYAN',
    secretCouponDiscount: 50  // This makes final price 29 (79 - 50)
  }
};

export const PRODUCTS = [
  {
    productId: 'DEFAULT_PDF_1',
    title: 'Professional Outreach & Communication Learning Guide',
    description:
      'An educational PDF resource containing learning frameworks, example templates, and case studies for professional networking and business communication. All content is for educational purposes only, based on publicly available information.',
    originalPrice: 475,
    sellingPrice: 75,
    // Server-side only: never sent to the client
    secureFileName: 'product-default.pdf',
  },
];

export const getProductById = (productId) => {
  if (!productId) return PRODUCTS[0];
  return PRODUCTS.find((p) => p.productId === productId) || PRODUCTS[0];
};

// Get package pricing (backend-only, never trust frontend)
export const getPackagePrice = (packageType) => {
  return PACKAGE_PRICING[packageType] || null;
};

// Validate coupon for specific package
export const validateCouponForPackage = (packageType, couponCode) => {
  const packageInfo = PACKAGE_PRICING[packageType];
  if (!packageInfo) return false;
  
  // Only package 5 supports coupons
  if (packageType !== '5') return false;
  
  const appliedCoupon = (couponCode || '').trim().toUpperCase();
  
  // Check for secret coupon first (ARYAN)
  if (appliedCoupon === packageInfo.secretCouponCode) {
    return {
      valid: true,
      discount: packageInfo.secretCouponDiscount,
      finalPrice: packageInfo.price - packageInfo.secretCouponDiscount
    };
  }
  
  // Check for regular coupon (HELLOBIT)
  if (appliedCoupon === packageInfo.couponCode) {
    return {
      valid: true,
      discount: packageInfo.couponDiscount,
      finalPrice: packageInfo.price - packageInfo.couponDiscount
    };
  }
  
  return { valid: false };
};

 
