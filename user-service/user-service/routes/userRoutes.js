const router    = require("express").Router();
const bcrypt    = require("bcryptjs");
const UserModel = require("../models/userModel");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");


router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("[user/me]", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const user = await UserModel.update(req.user.userId, { name, email, hashedPassword });
    res.json(user);
  } catch (err) {
    console.error("[user/me PUT]", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const users = await UserModel.findAll({
      search,
      limit: +limit,
      offset: (+page - 1) * +limit,
    });
    res.json(users);
  } catch (err) {
    console.error("[user/list]", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await UserModel.deleteById(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("[user/delete]", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
