const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Received message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

    const response = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are Vicky Electronics AI assistant.
Only answer electronics-related questions.
Recommend budget-friendly products.

User question:
${message}
                `
              }
            ]
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

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({ reply });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
