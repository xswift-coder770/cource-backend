import nodemailer from 'nodemailer';

/**
 * Create reusable transporter object using SMTP transport
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'robertwayen911@gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password for Gmail
    },
  });
};

/**
 * Send download link email to customer
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {string} downloadUrl - Secure download URL with token
 */
export const sendDownloadEmail = async (email, name, downloadUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"PDF Store" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your PDF Download Link - Secure Access',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your PDF Download</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Thank You for Your Purchase!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p style="font-size: 16px;">Hi ${name},</p>
            
            <p style="font-size: 16px;">
              Your payment has been confirmed successfully. You can now download your PDF using the secure link below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadUrl}" 
                 style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Download PDF
              </a>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #856404;">
                <strong>⚠️ Important:</strong> This download link is valid for 24 hours and can only be used once. 
                Please download and save the PDF to your device.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              If you have any questions or need assistance, please don't hesitate to contact us.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Best regards,<br>
              <strong>PDF Store Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank You for Your Purchase!
        
        Hi ${name},
        
        Your payment has been confirmed successfully. You can now download your PDF using the secure link below:
        
        ${downloadUrl}
        
        Important: This download link is valid for 24 hours and can only be used once. Please download and save the PDF to your device.
        
        If you have any questions or need assistance, please don't hesitate to contact us.
        
        Best regards,
        PDF Store Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
