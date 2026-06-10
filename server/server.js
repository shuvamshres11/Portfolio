require('dotenv').config();
const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Nodemailer transporter (Gmail + App Password) ──────────
const transporter = nodemailer.createTransport({
  host  : 'smtp.gmail.com',
  port  : 587,
  secure: false,                      // STARTTLS
  auth  : {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection on startup
transporter.verify((err) => {
  if (err) {
    console.error('❌  Mail transporter error:', err.message);
    console.error('    → EMAIL_USER:', process.env.EMAIL_USER);
    console.error('    → EMAIL_PASS length:', process.env.EMAIL_PASS?.length, 'chars');
  } else {
    console.log('✅  Mail server ready — waiting for messages.');
  }
});

// ── POST /send ─────────────────────────────────────────────
app.post('/send', async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  // ── Email to YOU (notification) ────────────────────────
  const toYouOptions = {
    from    : `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to      : process.env.EMAIL_TO,   // shuvamshes11@gmail.com
    replyTo : email,
    subject : `📩 New message from ${name} — Portfolio`,
    html    : `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1c1f; color: #e8e6e2; border-radius: 12px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #242427, #2c2c30); padding: 32px 40px; border-bottom: 1px solid rgba(200,168,130,0.2);">
          <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #c8a882; letter-spacing: -0.02em;">
            ✦ New Portfolio Message
          </h1>
          <p style="margin: 6px 0 0; color: #8e8e99; font-size: 13px;">Someone reached out through your portfolio contact form</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 40px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(180,185,200,0.1); color: #8e8e99; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; width: 100px;">From</td>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(180,185,200,0.1); color: #e8e6e2; font-size: 15px; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(180,185,200,0.1); color: #8e8e99; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid rgba(180,185,200,0.1);">
                <a href="mailto:${email}" style="color: #c8a882; text-decoration: none; font-size: 15px;">${email}</a>
              </td>
            </tr>
          </table>

          <div style="margin-top: 28px;">
            <p style="margin: 0 0 10px; color: #8e8e99; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">Message</p>
            <div style="background: #242427; border: 1px solid rgba(180,185,200,0.12); border-radius: 10px; padding: 20px 24px; color: #e8e6e2; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
              ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
          </div>

          <div style="margin-top: 28px;">
            <a href="mailto:${email}?subject=Re: Your message to Subham Shrestha" 
               style="display: inline-block; background: #c8a882; color: #161618; text-decoration: none; padding: 12px 24px; border-radius: 100px; font-size: 14px; font-weight: 600;">
              Reply to ${name} ↗
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 40px; background: #161618; border-top: 1px solid rgba(180,185,200,0.08); text-align: center;">
          <p style="margin: 0; color: #5a5a66; font-size: 12px;">Subham Shrestha — Portfolio Contact Form</p>
        </div>
      </div>
    `,
  };

  // ── Auto-reply to SENDER ───────────────────────────────
  const autoReplyOptions = {
    from    : `"Subham Shrestha" <${process.env.EMAIL_USER}>`,
    to      : email,
    subject : `Thanks for reaching out, ${name}! 👋`,
    html    : `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #1c1c1f; color: #e8e6e2; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #242427, #2c2c30); padding: 32px 40px; border-bottom: 1px solid rgba(200,168,130,0.2);">
          <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #c8a882;">Hey ${name}, thanks for writing! ✦</h1>
        </div>
        <div style="padding: 32px 40px;">
          <p style="color: #e8e6e2; line-height: 1.7;">I've received your message and will get back to you as soon as possible — usually within 24–48 hours.</p>
          <p style="color: #8e8e99; line-height: 1.7; font-size: 14px;">Here's a copy of what you sent:</p>
          <div style="background: #242427; border-radius: 10px; padding: 16px 20px; margin: 16px 0; color: #b0b8c8; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <p style="color: #e8e6e2;">Cheers,<br/><strong style="color: #c8a882;">Subham Shrestha</strong></p>
        </div>
        <div style="padding: 16px 40px; background: #161618; border-top: 1px solid rgba(180,185,200,0.08); text-align: center;">
          <p style="margin: 0; color: #5a5a66; font-size: 12px;">BSc (Hons) Computer Science · Herald College Kathmandu</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(toYouOptions);
    await transporter.sendMail(autoReplyOptions);
    console.log(`📧  Message from ${name} (${email}) sent successfully.`);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('❌  Failed to send email:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send message. Please try again.' });
  }
});

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'Portfolio contact server running ✦' }));

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
