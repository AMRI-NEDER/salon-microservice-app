const db = require("../config/db");

const UserModel = {
  findById: async (id) => {
    const result = await db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id]
    );
    return result.rows[0] || null;
  },

  update: async (id, { name, email, hashedPassword }) => {
    const result = await db.query(
      `UPDATE users SET
        name     = COALESCE($1, name),
        email    = COALESCE($2, email),
        password = COALESCE($3, password)
       WHERE id = $4
       RETURNING id, name, email, role, created_at`,
      [name || null, email || null, hashedPassword || null, id]
    );
    return result.rows[0] || null;
  },

  findAll: async ({ search, limit, offset }) => {
    const params = [];
    let query = "SELECT id, name, email, role, created_at FROM users";
    if (search) {
      params.push(`%${search}%`);
      query += " WHERE name ILIKE $1 OR email ILIKE $1";
    }
    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const result = await db.query(query, params);
    return result.rows;
  },

  deleteById: async (id) => {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
  },
};

module.exports = UserModel;
