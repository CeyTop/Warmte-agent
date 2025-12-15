const OpenAI = require("openai");

// Basis CORS; pas origin aan naar je eigen domein als je die hebt
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "*";

module.exports = async function handler(req, res) {
  // CORS preflight
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body = req.body || {};
    const userMessage = (body.message || "").toString().trim();
    if (!userMessage) return res.status(400).json({ error: "message required" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "missing OPENAI_API_KEY" });

    const client = new OpenAI({ apiKey });

    // Vervang modelnaam door je eigen custom model-id zodra je die hebt
    const modelName = process.env.OPENAI_MODEL || "gpt-4.1";

    // Plaats hier je vaste regels/restricties
    const SYSTEM_PROMPT = `
Je bent een warmte-adviseur voor overkappingen/veranda’s met glazen schuifwanden.
Geen prijzen/offertes/pakketten; alleen advies over warmtebehoud, comfort, tocht, isolatie, energiebesparing.
Als iets buiten scope is: "Dat valt buiten mijn expertise, maar ik help je graag verder met vragen over warmtebehoud en glazen schuifwanden."
`;

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      temperature: 0.4
    });

    const answer = completion.choices?.[0]?.message?.content || "";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
};

