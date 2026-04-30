const router = require("express").Router();
const db     = require("../config/db");
const { requireAdmin } = require("../middleware/authMiddleware");


router.get("/", async (req, res) => {
  try {
    const { all } = req.query;
    let query = "SELECT * FROM promotions";
    if (!all) query += " WHERE is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE)";
    query += " ORDER BY created_at DESC";
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("[promotion/list]", err.message);
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, description, discount_percent, start_date, end_date, is_active = true } = req.body;
    if (!title || discount_percent === undefined)
      return res.status(400).json({ error: "title and discount_percent are required" });

    const result = await db.query(
      `INSERT INTO promotions (title, description, discount_percent, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description || null, discount_percent, start_date || null, end_date || null, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("[promotion/create]", err.message);
    res.status(500).json({ error: "Failed to create promotion" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, description, discount_percent, start_date, end_date, is_active } = req.body;
    const result = await db.query(
      `UPDATE promotions SET
        title            = COALESCE($1, title),
        description      = COALESCE($2, description),
        discount_percent = COALESCE($3, discount_percent),
        start_date       = COALESCE($4, start_date),
        end_date         = COALESCE($5, end_date),
        is_active        = COALESCE($6, is_active)
       WHERE id = $7 RETURNING *`,
      [title, description, discount_percent, start_date, end_date, is_active, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Promotion not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("[promotion/update]", err.message);
    res.status(500).json({ error: "Failed to update promotion" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM promotions WHERE id = $1 RETURNING id", [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Promotion not found" });
    res.json({ message: "Promotion deleted" });
  } catch (err) {
    console.error("[promotion/delete]", err.message);
    res.status(500).json({ error: "Failed to delete promotion" });
  }
});

module.exports = router;
