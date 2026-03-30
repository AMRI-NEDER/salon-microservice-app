require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.status(200).json({ status: "UP", service: "auth-service", path: "/" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "auth-service", path: "/health" });
});

app.get("/api/auth/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "auth-service", path: "/api/auth/health" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[auth-service] Running on port ${PORT}`);
});

console.log("pipeline auto redeploy test 2 ");