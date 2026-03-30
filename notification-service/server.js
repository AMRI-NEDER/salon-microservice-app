require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mailService = require("./services/mailService"); // ✅ مهم

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).json({
  status: "UP",
  service: "notification-service",
  path: "/"
}));

app.get("/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "notification-service",
  path: "/health"
}));

app.get("/api/notifications/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "notification-service",
  path: "/api/notifications/health"
}));

// changer votre mail ici pour tester le service mail
app.get("/api/notifications/test-email", async (req, res) => {
  await mailService.sendMail({
    to: "elamrineder100@gmail.com",
    subject: "Aura Cut",
    text: "Welcome To Aura cut Nader",
  });

  res.json({ message: "Email sent" });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[notification-service] Running on port ${PORT}`);
});