const db = require("../config/db");

const BookingModel = {

  findAll: async (userId, role) => {
    if (role === "admin") {
      const { rows } = await db.query(
        "SELECT * FROM bookings ORDER BY date DESC, time DESC"
      );
      return rows;
    }
    const { rows } = await db.query(
      "SELECT * FROM bookings WHERE user_id=$1 ORDER BY date DESC, time DESC",
      [userId]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query(
      "SELECT * FROM bookings WHERE id=$1", [id]
    );
    return rows[0] || null;
  },

  create: async ({ userId, userName, userEmail, service, date, time, notes }) => {
    const { rows } = await db.query(
      `INSERT INTO bookings
         (user_id, user_name, user_email, service, date, time, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,'confirmed',$7)
       RETURNING *`,
      [userId, userName||"", userEmail||"", service, date, time, notes||null]
    );
    return rows[0];
  },

  updateStatus: async (id, status) => {
    const { rows } = await db.query(
      "UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    return rows[0] || null;
  },

  deleteById: async (id) => {
    await db.query("DELETE FROM bookings WHERE id=$1", [id]);
  },
};

module.exports = BookingModel;
