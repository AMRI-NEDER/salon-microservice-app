require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/reservations", require("./routes/reservationRoutes"));

app.get("/", (req, res) => res.status(200).json({
  status: "UP",
  service: "reservation-service",
  path: "/"
}));

app.get("/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "reservation-service",
  path: "/health"
}));

app.get("/api/reservations/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "reservation-service",
  path: "/api/reservations/health"
}));

const PORT = process.env.PORT || 3004;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[reservation-service] Running on port ${PORT}`);
});


console.log("pipeline auto redeploy test 2 ");