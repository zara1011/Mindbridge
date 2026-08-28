const express = require("express");
const path = require("path");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI KEY MISSING");
} else {
  console.log("GEMINI KEY LOADED");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM_PROMPT = `
You are MindBridge, a supportive AI conversation companion for mental wellbeing.

Help users:
- express difficult feelings
- think through everyday problems
- practise difficult conversations
- identify small practical next steps

You are not a therapist or doctor.
Do not diagnose mental-health conditions.
Do not claim to cure mental-health conditions.
Do not provide instructions for self-harm or suicide.
Do not encourage dependence on the AI.

Be calm, warm, respectful, concise and non-judgmental.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is missing."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${SYSTEM_PROMPT}

User message:
${message}`
    });

    console.log("Gemini response received.");

    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    res.status(500).json({
      error: "AI connection failed.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`MindBridge running on http://localhost:${PORT}`);
});