# PDF Upload Instructions

## 📁 Required PDF Files

Upload these 4 PDF files to this `uploads/` folder:

1. **package1.pdf** - Contains 500 HR email IDs
2. **package2.pdf** - Contains 1000 HR email IDs  
3. **package3.pdf** - Contains 1500 HR email IDs
4. **package4.pdf** - Contains 2500 HR email IDs

## ✅ File Naming

**IMPORTANT:** The files MUST be named exactly as shown above:
- `package1.pdf` (lowercase, no spaces)
- `package2.pdf`
- `package3.pdf`
- `package4.pdf`

## 📍 File Location

Place all 4 PDFs in:
```
server/uploads/
```

## 🔍 Verification

After uploading, the backend will automatically:
- Serve `package1.pdf` when Package 1 is purchased
- Serve `package2.pdf` when Package 2 is purchased
- Serve `package3.pdf` when Package 3 is purchased
- Serve `package4.pdf` when Package 4 is purchased

## ⚠️ Security Note

These PDFs are NEVER publicly accessible. They are only served through the secure download endpoint after payment verification.
