import nodemailer from "nodemailer";
import Contact from "../models/Contact.js"; // ✅ Import your model

export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    // ✅ Save to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // hello@thetpod.tech
        pass: process.env.EMAIL_PASS,
      },
    });

    /** 
     * 1) Send to YOURSELF (admin)
     */
    const adminMail = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    /** 
     * 2) Send auto-reply to USER
     */
    const userMail = {
      from: `"Servocci Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ We received your message!",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out to us! 🙌</p>
        <p>We’ve received your message and our team will get back to you soon.</p>
        <hr/>
        <p><strong>Your Message:</strong></p>
        <p>${message}</p>
        <br/>
        <p>Best regards,<br/>The Servocci Team 🚀</p>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.status(200).json({ success: true, message: "Message saved & emails sent!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};
