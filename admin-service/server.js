require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", require("./routes/adminRoutes"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "admin-service" });
});

const PORT = process.env.PORT || 3008;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`admin-service running on port ${PORT}`);
});