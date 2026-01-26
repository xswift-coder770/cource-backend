# PDF Storage Directory

## Important Security Notice

This directory stores the PDF file that customers purchase. **This folder must NEVER be publicly accessible.**

## Setup Instructions

1. Place your PDF file in this directory
2. Rename it to exactly: `product.pdf`
3. Ensure the file is readable by the Node.js process
4. Do NOT expose this directory via web server static file serving

## File Requirements

- File name: `product.pdf` (exact match, case-sensitive)
- File format: PDF
- Recommended: Keep file size under 50MB for better download experience

## Security

The PDF is served through the secure download endpoint (`/api/download/:token`) which:
- Validates the download token
- Checks token expiration
- Ensures one-time use
- Logs all download attempts

Never place the PDF in a public folder or expose it via direct URL.
