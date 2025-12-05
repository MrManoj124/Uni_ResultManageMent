// ==========================================
// config/email.js - Email Service Config
// ==========================================
module.exports = {
  gmail: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY
  },
  
  from: {
    name: 'ResultPro',
    email: process.env.EMAIL_USER || 'noreply@resultpro.lk'
  },
  
  templates: {
    verificationEmail: {
      subject: 'Verify Your Email - ResultPro',
      expiryHours: 24
    },
    passwordReset: {
      subject: 'Password Reset - ResultPro',
      expiryHours: 1
    },
    welcomeEmail: {
      subject: 'Welcome to ResultPro'
    },
    resultPublished: {
      subject: 'New Result Published - ResultPro'
    },
    staffCredentials: {
      subject: 'Your ResultPro Staff Account'
    }
  }
};