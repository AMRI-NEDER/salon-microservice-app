
const rules = [
  {
    patterns: ["price", "cost", "how much", "pricing", "rate", "charge", "fee"],
    reply: "Our services: Classic Cut dt35 · Signature Fade 45 · Beard Sculpt dt30 · Hot Towel Shave dt40 · Cut & Beard dt65 · Full Groom Package dt85. All include a complimentary hot towel finish.",
  },
  {
    patterns: ["book", "appointment", "reserve", "schedule", "slot", "visit"],
    reply: "You can book directly through the Booking page — select a service, pick a date and available time slot. Confirmation is instant.",
  },
  {
    patterns: ["hour", "open", "close", "when", "time", "today"],
    reply: "We're open Monday to Saturday 9am–8pm and Sunday 10am–5pm. Closed on public holidays.",
  },
  {
    patterns: ["location", "address", "where", "find", "direction", "map", "tube"],
    reply: "We're at 10 Row, siliana. Nearest tube: Oxford Circus or Green Park — both a short walk.",
  },
  {
    patterns: ["promo", "discount", "offer", "deal", "voucher", "special", "saving"],
    reply: "Current offers: 20% off your first visit · dt15 off the Summer Groom Bundle · Free cut after 5 loyalty visits · £10 referral credit for you and a friend.",
  },
  {
    patterns: ["cancel", "cancellation", "refund", "policy"],
    reply: "We ask for 24 hours' notice to cancel or reschedule. Late cancellations may incur a 50% charge. Cancel anytime through your account.",
  },
  {
    patterns: ["fade", "taper", "skin fade", "gradient", "low fade", "high fade"],
    reply: "Our Signature Fade starts from dt45. Our barbers handle every style — low, mid, high, skin, and shadow fades. Note your preference when booking.",
  },
  {
    patterns: ["beard", "shave", "moustache", "facial hair", "hot towel"],
    reply: "Beard Sculpt is dt30 — precision shaping and conditioning. Hot Towel Shave is dt40 — the classic straight-razor wet shave. Both available as a combo with a haircut for dt65.",
  },
  {
    patterns: ["park", "parking", "car", "drive"],
    reply: "Paid on-street parking is available on nearby streets. Several NCP car parks are within a 5-minute walk of Savile Row.",
  },
  {
    patterns: ["wifi", "wi-fi", "internet", "password", "connect"],
    reply: "Complimentary Wi-Fi is available for all clients. Ask the front desk for the current password when you arrive.",
  },
  {
    patterns: ["pay", "card", "cash", "contactless", "apple pay", "google pay"],
    reply: "We accept all major debit and credit cards, contactless, Apple Pay, Google Pay, and cash.",
  },
  {
    patterns: ["walk in", "walk-in", "queue", "wait", "available now"],
    reply: "Walk-ins are welcome subject to availability. We always recommend booking in advance to secure your preferred time slot.",
  },
  {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    reply: "Welcome to Aura Cut ✦ I'm Aura, your personal concierge. Ask me anything about our services, pricing, availability, or how to book.",
  },
  {
    patterns: ["thank", "thanks", "cheers", "appreciate"],
    reply: "You're most welcome! Is there anything else I can help you with?",
  },
  {
    patterns: ["bye", "goodbye", "see you", "later"],
    reply: "Goodbye! We look forward to welcoming you at Aura Cut ✦",
  },
];

function getRulesReply(message) {
  const lower = message.toLowerCase();
  for (const rule of rules) {
    if (rule.patterns.some((p) => lower.includes(p))) return rule.reply;
  }
  return "For specific enquiries, please call us on +216 95 487 417 or email elamrineder100@gmail.com. We'd love to help!";
}

async function getClaudeReply(message, history = []) {
  const { default: fetch } = await import("node-fetch");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: `You are Aura, the AI concierge for Aura Cut — a premium barbershop on Savile Row, Mayfair, London.
Be warm, professional, and concise (2–3 sentences max).
Key facts:
- Services: Classic Cut £35, Signature Fade £45, Beard Sculpt £30, Hot Towel Shave £40, Cut & Beard £65, Full Groom £85
- Hours: Mon–Sat 9am–8pm, Sun 10am–5pm
- Address: 12 Savile Row, Mayfair, London W1S 3PQ
- Phone: +44 20 7946 0321
- Email: hello@auracut.co.uk`,
      messages: [...history, { role: "user", content: message }],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Claude API error");
  return data.content[0].text;
}

module.exports = { getRulesReply, getClaudeReply };
