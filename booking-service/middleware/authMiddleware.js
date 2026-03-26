const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "auracut_dev_secret";

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Authorization token required" });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    next();
  });
}

module.exports = { authenticate, requireAdmin };
