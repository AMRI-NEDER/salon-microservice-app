const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const JWT_SECRET     = process.env.JWT_SECRET || "auracut_dev_secret";
const JWT_EXPIRES_IN = "7d";


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await UserModel.findByEmail(email);
    if (existing)
      return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user  = await UserModel.create({ name, email, hashedPassword });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error("[auth/register]", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email and password are required" });

    const user = await UserModel.findByEmail(email);
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const { password: _, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error("[auth/login]", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/verify", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, payload });
  } catch {
    res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
});

module.exports = router;
