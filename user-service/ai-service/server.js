require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getRulesReply, getClaudeReply } = require("./services/aiLogic");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.status(200).json({
  status: "UP",
  service: "ai-service",
  path: "/",
  mode: process.env.USE_CLAUDE_API === "true" ? "claude-api" : "rules-based",
}));

app.get("/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "ai-service",
  path: "/health",
  mode: process.env.USE_CLAUDE_API === "true" ? "claude-api" : "rules-based",
}));

app.get("/api/ai/health", (req, res) => res.status(200).json({
  status: "UP",
  service: "ai-service",
  path: "/api/ai/health",
  mode: process.env.USE_CLAUDE_API === "true" ? "claude-api" : "rules-based",
}));

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    let reply;
    const useClaudeApi =
      process.env.USE_CLAUDE_API === "true" &&
      process.env.ANTHROPIC_API_KEY;

    if (useClaudeApi) {
      try {
        reply = await getClaudeReply(message.trim(), history);
      } catch (err) {
        console.warn("[ai-service] Claude API failed, falling back to rules:", err.message);
        reply = getRulesReply(message.trim());
      }
    } else {
      reply = getRulesReply(message.trim());
    }

    return res.status(200).json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[ai-service/chat]", err.message);
    return res.status(500).json({ error: "Chat failed" });
  }
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[ai-service] Running on port ${PORT}`);
});