import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  if (!to) {
    throw new Error("Recipient email (to) is required");
  }
  try {
    // console.log(`Sending email to: ${to}`);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Project Management Tool"<${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    // console.log(`Sending email to: ${to}`);
    // console.log(`Using sender: ${process.env.MY_EMAIL}`);

    await transporter.sendMail(mailOptions);
    // console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
