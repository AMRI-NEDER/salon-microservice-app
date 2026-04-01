require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => res.status(200).json({
  status: "UP",
  service: "user-service",
  path: "/"
}));

app.get("/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "user-service",
  path: "/health"
}));

app.get("/api/users/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "user-service",
  path: "/api/users/health"
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[user-service] Running on port ${PORT}`);
});

console.log("🔥 New update for pipeline test");