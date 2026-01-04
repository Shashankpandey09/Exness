import { Resend } from 'resend';
import dotenv from "dotenv";
dotenv.config();


export async function sendMagicLinkEmail(token: string, email: string) {
    const api_key = process.env.RESEND_API_KEY;

    if (!api_key) {
        console.error("RESEND_API_KEY is missing. Did you set it in .env?");
        throw new Error("RESEND_API_KEY is missing. Did you set it in .env?");
    }

    const resend = new Resend(api_key);
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email - Magic Link',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome!</h2>
          <p>Click the button below to verify your email and sign in:</p>
          <a href="${BASE_URL}/api/v1/user/verify?token=${token}" 
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
            text: `Welcome! Verify your email: ${BASE_URL}/api/v1/user/verify?token=${token}\nThis link will expire in 1 hour.`,
        });

        if (error) {
            console.error("Email sending failed:", error);
            return null;
        }

        console.log("Magic link email sent successfully:", data);
        return data;
    } catch (err) {
        console.error("Unexpected error sending email:", err);
        return null;
    }
}
