const router = require("express").Router();
const {
  authPool,
  bookingPool,
  reservationPool,
  notificationPool,
  promotionPool,
} = require("../config/db");
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const [users, bookings, todayB, pending, unread] = await Promise.all([
      authPool.query("SELECT COUNT(*) FROM users WHERE role = 'user'"),
      bookingPool.query("SELECT COUNT(*) FROM bookings"),
      bookingPool.query("SELECT COUNT(*) FROM bookings WHERE date = CURRENT_DATE"),
      bookingPool.query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'"),
      notificationPool.query("SELECT COUNT(*) FROM notifications WHERE is_read = FALSE"),
    ]);

    const monthly = await bookingPool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date::timestamp), 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM bookings
      WHERE status = 'completed'
        AND date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', date::timestamp)
      ORDER BY DATE_TRUNC('month', date::timestamp)
    `);

    const topServices = await bookingPool.query(`
      SELECT service AS name, COUNT(*) AS bookings
      FROM bookings
      WHERE status = 'completed'
      GROUP BY service
      ORDER BY bookings DESC
      LIMIT 5
    `);

    return res.json({
      stats: {
        total_users: parseInt(users.rows[0].count, 10),
        total_bookings: parseInt(bookings.rows[0].count, 10),
        today_bookings: parseInt(todayB.rows[0].count, 10),
        pending_bookings: parseInt(pending.rows[0].count, 10),
        unread_notifications: parseInt(unread.rows[0].count, 10),
      },
      monthly_bookings: monthly.rows,
      top_services: topServices.rows,
    });
  } catch (err) {
    console.error("[admin/dashboard]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { rows } = await authPool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error("[admin/users]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await authPool.query(
      "DELETE FROM users WHERE id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (err) {
    console.error("[admin/delete-user]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bookings", requireAdmin, async (req, res) => {
  try {
    const { rows } = await bookingPool.query(
      "SELECT * FROM bookings ORDER BY date DESC, time DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error("[admin/bookings]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bookings/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["confirmed", "cancelled", "completed", "no-show"];

    if (!valid.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${valid.join(", ")}`,
      });
    }

    const { rows } = await bookingPool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (status === "cancelled") {
      await reservationPool.query(
        `
        INSERT INTO reservations (date, time, is_available)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (date, time) DO UPDATE SET is_available = TRUE
        `,
        [rows[0].date, rows[0].time]
      );
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("[admin/update-booking-status]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bookings/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await bookingPool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await reservationPool.query(
      `
      INSERT INTO reservations (date, time, is_available)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (date, time) DO UPDATE SET is_available = TRUE
      `,
      [rows[0].date, rows[0].time]
    );

    return res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("[admin/delete-booking]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/promotions", requireAdmin, async (req, res) => {
  try {
    const { rows } = await promotionPool.query(
      "SELECT * FROM promotions ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error("[admin/promotions]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/promotions", requireAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      discount_percent,
      start_date,
      end_date,
      is_active = true,
    } = req.body;

    if (!title || discount_percent === undefined) {
      return res.status(400).json({
        error: "title and discount_percent required",
      });
    }

    if (Number(discount_percent) < 0 || Number(discount_percent) > 100) {
      return res.status(400).json({
        error: "discount_percent must be between 0 and 100",
      });
    }

    const { rows } = await promotionPool.query(
      `
      INSERT INTO promotions
        (title, description, discount_percent, start_date, end_date, is_active)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        title,
        description || null,
        discount_percent,
        start_date || null,
        end_date || null,
        is_active,
      ]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[admin/create-promotion]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/promotions/:id", requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await promotionPool.query(
      "DELETE FROM promotions WHERE id = $1",
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Promotion not found" });
    }

    return res.json({ message: "Promotion deleted" });
  } catch (err) {
    console.error("[admin/delete-promotion]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications", requireAdmin, async (req, res) => {
  try {
    const { rows } = await notificationPool.query(
      "SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 100"
    );
    return res.json(rows);
  } catch (err) {
    console.error("[admin/notifications]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notifications/broadcast", requireAdmin, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message required" });
    }

    const { rows: users } = await authPool.query(
      "SELECT id, name FROM users WHERE role = 'user'"
    );

    await Promise.all(
      users.map((u) =>
        notificationPool.query(
          "INSERT INTO notifications (user_id, user_name, message) VALUES ($1, $2, $3)",
          [u.id, u.name, message]
        )
      )
    );

    return res.json({ message: `Broadcast sent to ${users.length} users` });
  } catch (err) {
    console.error("[admin/broadcast]", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/health", async (req, res) => {
  return res.json({ status: "ok", service: "admin-service" });
});

module.exports = router;