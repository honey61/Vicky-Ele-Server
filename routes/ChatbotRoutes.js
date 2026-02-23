const express = require("express");
const router = express.Router();
const { getMcpContext } = require("../services/chatbotMcpService");

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Received message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const mcpContext = await getMcpContext(message);
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      if (!mcpContext.found) {
        return res.json({
          reply:
            "I could not find relevant products in our database for that question. Please ask by product name, category, capacity, or budget."
        });
      }

      const quickReply = [
        "Here are products I found in our database:",
        mcpContext.contextText
      ].join("\n");

      return res.json({ reply: quickReply });
    }

    const url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

    const prompt = [
      "You are Vicky Electronics AI assistant.",
      "Use database context as the primary source of truth.",
      "Only answer electronics-related questions.",
      "If no matching products are found, ask a short clarifying question.",
      "Respond in concise, friendly text for a website chatbot.",
      "",
      "Database context from MCP:",
      mcpContext.contextText,
      "",
      "User question:",
      message
    ].join("\n");

    const response = await fetch(`${url}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return res.status(500).json({
        error: "Gemini API failed",
        details: data
      });
    }

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiReply) {
      return res.json({ reply: aiReply });
    }

    if (mcpContext.found) {
      return res.json({
        reply: `Here are products I found in our database:\n${mcpContext.contextText}`
      });
    }

    return res.json({
      reply: "I could not find an exact match yet. Please share product type, brand/model, and budget."
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
