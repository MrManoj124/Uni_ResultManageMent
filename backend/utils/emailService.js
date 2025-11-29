import nodemailer from 'nodemailer';

//Email transporter configuration
const transporter = nodemailer.createrTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }
});

//send verification email
export const senderVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from:process.env.EMAIL_USER,
        to:email,
        subject:'Email Verification - MyApp',
        html:`
        <div style="font-family:Arial, sans-serif; padding:20px">
        <h1 style='color:#667eea;'>Verify Your Email</h1>
        <p> Thank you for Registering! Please click the button below to verify your email Address:</p>
        <a herf="${verificationUrl}"
        style="display: inline=block; padding:12px 24px; background: #667eea; color:white; text-decoration: none; border-radius: 5px; margin:20px 0;">
        Verify Email
        </a>
        <p style="color: #666;">Or copy this link: ${verificationUrl}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        </div> 
        `
    };

    try{
        await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent to :', email);
    }
    catch(error){
        console.error(' ❌ Email sending error: ',error);
        throw new Error('Failed to send verification email');
    }
};

//Send password reset email
export const sendPasswordResetEmail=async (email, token) => {
    const 
}


