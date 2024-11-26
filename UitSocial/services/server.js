const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Điều chỉnh nguồn gốc tin cậy

// Cấu hình transport cho Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Hoặc SMTP của dịch vụ khác
  auth: {
    user: "khang19772003@gmail.com", // Địa chỉ email của bạn
    pass: "your-app-password", // Thay bằng mật khẩu ứng dụng
  },
});

// Endpoint để gửi email
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await transporter.sendMail({
      from: "khang19772003@gmail.com", // Phải khớp với user
      to: to,
      subject: subject,
      text: text,
    });
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ error: "Failed to send email.", details: error.message });
  }
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
