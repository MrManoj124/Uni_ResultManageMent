// backend/utils/email.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const templates = {
  emailVerification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 ResultPro</h1>
          <p>University Result Management System</p>
        </div>
        <div class="content">
          <h2>Welcome ${data.name}!</h2>
          <p>Thank you for registering with ResultPro. Please verify your email address to activate your account.</p>
          <div style="text-align: center;">
            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${data.verificationUrl}</p>
          <p style="margin-top: 30px; color: #999;">This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>© 2025 ResultPro | University of Vavuniya</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcome: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ResultPro!</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name}!</h2>
          <p>Your email has been verified successfully. You now have full access to ResultPro.</p>
          
          <h3>What you can do:</h3>
          <div class="feature">
            <strong>📊 View Results</strong><br>
            Access your examination results anytime, anywhere
          </div>
          <div class="feature">
            <strong>📈 Track GPA</strong><br>
            Automatic GPA/CGPA calculation for all your courses
          </div>
          <div class="feature">
            <strong>📥 Download Reports</strong><br>
            Download and print your personalized result sheets
          </div>
          <div class="feature">
            <strong>🔔 Get Notifications</strong><br>
            Receive instant updates when new results are published
          </div>
          
          <p style="margin-top: 30px;">Get started by logging into your account at <a href="${process.env.FRONTEND_URL}/login" style="color: #667eea;">ResultPro</a></p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 ResultPro | University of Vavuniya</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name},</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </div>
          <p style="word-break: break-all; color: #f5576c; font-size: 14px;">${data.resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned.
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 ResultPro | University of Vavuniya</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordChanged: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Changed</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name},</h2>
          <p>Your password has been successfully changed.</p>
          <p>If you did not make this change, please contact support immediately at <a href="mailto:support@resultpro.lk">support@resultpro.lk</a></p>
          <p style="margin-top: 30px; color: #666;">Time: ${new Date().toLocaleString()}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 ResultPro | University of Vavuniya</p>
        </div>
      </div>
    </body>
    </html>
  `,

  resultPublished: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .result-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .grade { font-size: 48px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Result Published!</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.studentName},</h2>
          <p>Your result for <strong>${data.courseName}</strong> has been published!</p>
          
          <div class="result-card">
            <h3 style="margin-top: 0;">${data.courseCode} - ${data.courseName}</h3>
            <div class="grade">${data.grade}</div>
            <p style="text-align: center; color: #666;">
              Marks: ${data.marks}/100 | Credits: ${data.credits}<br>
              GPA Points: ${data.gradePoints}
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/student/results" class="button">View Full Results</a>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Your current CGPA: <strong>${data.cgpa}</strong>
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 ResultPro | University of Vavuniya</p>
        </div>
      </div>
    </body>
    </html>
  `,

  staffCredentials: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👨‍🏫 Welcome to ResultPro Staff Portal</h1>
        </div>
        <div class="content">
          <h2>Hello ${data.name},</h2>
          <p>Your staff account has been created successfully. Here are your login credentials:</p>
          
          <div class="credentials">
            <p><strong>Username:</strong> ${data.username}</p>
            <p><strong>Temporary Password:</strong> ${data.password}</p>
            <p><strong>Staff ID:</strong> ${data.staffId}</p>
            <p><strong>Department:</strong> ${data.department}</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong><br>
            Please change your password after your first login for security purposes.
          </div>
          
          <p>Login at: <a href="${process.env.FRONTEND_URL}/login" style="color: #667eea;">${process.env.FRONTEND_URL}/login</a></p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 ResultPro | University of Vavuniya</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Send email function
exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();

    // Get HTML content from template
    const htmlContent = templates[template] ? templates[template](data) : data.html || data.message;

    const mailOptions = {
      from: `ResultPro <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send bulk emails
exports.sendBulkEmails = async (emails) => {
  try {
    const results = await Promise.allSettled(
      emails.map(email => this.sendEmail(email))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: true,
      sent: successful,
      failed,
      results
    };
  } catch (error) {
    throw new Error(`Bulk email sending failed: ${error.message}`);
  }
};

// Verify email configuration
exports.verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};