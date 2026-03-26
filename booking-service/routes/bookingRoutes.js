const router       = require("express").Router();
const BookingModel = require("../models/bookingModel");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// GET /  — list bookings (own or all for admin)
router.get("/", authenticate, async (req, res) => {
  try {
    const bookings = await BookingModel.findAll(req.user.userId, req.user.role);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET /:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (req.user.role !== "admin" && booking.user_id !== req.user.userId)
      return res.status(403).json({ error: "Forbidden" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// POST /  — create booking
// Note: slot marking + notification are handled by frontend after this call
router.post("/", authenticate, async (req, res) => {
  try {
    const { service, date, time, notes, userName, userEmail } = req.body;
    if (!service || !date || !time)
      return res.status(400).json({ error: "service, date and time are required" });

    const booking = await BookingModel.create({
      userId:    req.user.userId,
      userName:  userName  || "",
      userEmail: userEmail || "",
      service, date, time, notes,
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// PATCH /:id/status
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["confirmed","cancelled","completed","no-show"];
    if (!valid.includes(status))
      return res.status(400).json({ error: `status must be one of: ${valid.join(", ")}` });

    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (req.user.role !== "admin" && booking.user_id !== req.user.userId)
      return res.status(403).json({ error: "Forbidden" });

    const updated = await BookingModel.updateStatus(req.params.id, status);
    // Note: slot freeing on cancel is handled by frontend (calls reservation-service)
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// DELETE /:id
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (req.user.role !== "admin" && booking.user_id !== req.user.userId)
      return res.status(403).json({ error: "Forbidden" });

    await BookingModel.deleteById(req.params.id);
    // Note: slot freeing handled by frontend
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

module.exports = router;
