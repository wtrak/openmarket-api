import express from 'express';
import { OpenAI } from 'openai';
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  console.log("✅ POST /analyze hit");
  console.log("🧾 Incoming body:", req.body);  // <-- moved inside the handler

  try {
    const base64 = req.body.imageBase64;
    const prompt = `List all the individual items shown in this image as separate objects for sale at a flea market. For each, give a short title, category, 1-sentence description, and estimated price.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                image_base64: base64?.split(',')[1] || ''
              }
            }
          ]
        }
      ]
    });

    const text = response.choices[0].message.content;

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    let items = [];

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const json = text.slice(jsonStart, jsonEnd + 1);
      items = JSON.parse(json).items || [];
    }

    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI failed to return items.' });
  }
});

export default router;
