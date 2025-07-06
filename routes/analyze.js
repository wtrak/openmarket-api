import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an assistant that analyzes photos of flea market booths and generates an inventory of visible items. Return a JSON array with item titles, categories, descriptions, and estimated prices."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this booth photo and generate the item inventory." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const reply = response.choices[0]?.message?.content;
    res.json({ result: reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

export default router;
