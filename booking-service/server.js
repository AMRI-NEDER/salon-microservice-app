require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).json({
  status: "UP",
  service: "booking-service",
  path: "/"
}));

app.get("/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "booking-service",
  path: "/health"
}));

app.get("/api/bookings/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "booking-service",
  path: "/api/bookings/health"
}));

app.use("/api/bookings", require("./routes/bookingRoutes"));

const PORT = process.env.PORT || 3003;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[booking-service] Running on port ${PORT}`);
});