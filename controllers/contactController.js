import nodemailer from "nodemailer";
import Contact from "../models/Contact.js";

export const sendContactEmail = async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All required fields must be filled" });
  }

  try {
    // ✅ Save to MongoDB
    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    /**
     * 1) Send to ADMIN
     */
    const adminMail = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    /**
     * 2) Auto-reply to USER
     */
    const userMail = {
      from: `"Servocci Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ We received your message!",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out! 🙌</p>
        <p>We’ve received your message and our team will get back to you soon.</p>
        <hr/>
        <p><strong>Your Message:</strong></p>
        <p>${message}</p>
        ${phone ? `<p><strong>Your Phone:</strong> ${phone}</p>` : ""}
        <br/>
        <p>Best regards,<br/>The Servocci Team 🚀</p>
      `,
    };

    // ✅ Send both emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(userMail);

    res.status(200).json({ success: true, message: "Message saved & emails sent!", data: newContact });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, message: "Failed to process request", error: error.message });
  }
};
