const router = require("express").Router();
const db     = require("../config/db");
const { requireAdmin, authenticate } = require("../middleware/authMiddleware");

router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date query param required (YYYY-MM-DD)" });
    const result = await db.query(
      "SELECT * FROM reservations WHERE date = $1 ORDER BY time", [date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("[reservation/list]", err.message);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

router.get("/check", async (req, res) => {
  try {
    const { date, time } = req.query;
    if (!date || !time)
      return res.status(400).json({ error: "date and time are required" });
    const result = await db.query(
      "SELECT is_available FROM reservations WHERE date = $1 AND time = $2", [date, time]
    );
    const available = result.rows.length === 0 || result.rows[0].is_available;
    res.json({ available, date, time });
  } catch (err) {
    res.status(500).json({ error: "Check failed" });
  }
});

router.post("/generate", requireAdmin, async (req, res) => {
  try {
    const { start_date, end_date, times } = req.body;
    if (!start_date || !end_date)
      return res.status(400).json({ error: "start_date and end_date are required" });

    const defaultTimes = [
      "09:00","09:30","10:00","10:30","11:00","11:30",
      "13:00","13:30","14:00","14:30","15:00","15:30",
      "16:00","16:30","17:00","17:30","18:00","18:30",
    ];
    const slotTimes = times || defaultTimes;
    let count = 0;

    for (let d = new Date(start_date); d <= new Date(end_date); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      for (const t of slotTimes) {
        await db.query(
          `INSERT INTO reservations (date, time, is_available)
           VALUES ($1, $2, true)
           ON CONFLICT (date, time) DO NOTHING`,
          [dateStr, t]
        );
        count++;
      }
    }
    res.json({ message: `Generated ${count} slots`, start_date, end_date });
  } catch (err) {
    console.error("[reservation/generate]", err.message);
    res.status(500).json({ error: "Generation failed" });
  }
});

// PATCH /mark  — frontend calls this after booking to update slot availability
router.patch("/mark", authenticate, async (req, res) => {
  try {
    const { date, time, is_available } = req.body;
    if (!date || !time || is_available === undefined)
      return res.status(400).json({ error: "date, time, is_available required" });
    await db.query(
      `INSERT INTO reservations (date, time, is_available)
       VALUES ($1,$2,$3)
       ON CONFLICT (date, time) DO UPDATE SET is_available=$3`,
      [date, time, is_available]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("[reservation/mark]", err.message);
    res.status(500).json({ error: "Failed to mark slot" });
  }
});

module.exports = router;