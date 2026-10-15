import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize CRO copy engine if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// Copy Optimization Endpoint
app.post('/api/ai-optimize', async (req, res) => {
  try {
    const { storeNiche, targetAudience, currentCopy, goal } = req.body;

    if (!apiKey || !aiClient) {
      // High-converting built-in CRO rules
      return res.json({
        success: true,
        source: 'cro_rules_engine',
        suggestions: {
          headline: `Unlock Free Express Shipping on orders over $${goal || '75'}`,
          subtext: "Limited daily stock reserved in your cart. Checkout in the next 10 minutes to secure your complimentary gift.",
          urgencyBadge: "High demand item — 4 people have this in their cart",
          upsellPitch: "Pair with our artisanal companion care set for 20% off today.",
          whatsappMessage: "Hi! I saved your cart on our store with complimentary shipping reserved. Would you like me to process your order directly?"
        }
      });
    }

    const prompt = `You are a world-class eCommerce conversion rate optimization (CRO) expert for WooCommerce stores.
A merchant has requested high-converting, non-spammy copy for their WooCommerce cart drawer and exit recovery modal.

Context:
- Store Niche / Product Type: ${storeNiche || 'Premium Artisanal Goods'}
- Target Customer: ${targetAudience || 'Discerning online shoppers'}
- Current Copy / Idea: ${currentCopy || 'Standard Free Shipping progress and exit discount'}
- Free Shipping / Milestone Goal: ${goal || 'Free Shipping + Mystery Gift'}

Generate 3 refined conversion copy variants in JSON format with the following fields:
{
  "headline": "A punchy, motivating threshold progress headline (under 10 words)",
  "subtext": "A reassurance or subtle urgency line (under 18 words)",
  "urgencyBadge": "A tasteful low-stock or cart reservation badge (under 8 words)",
  "upsellPitch": "A compelling 1-click in-cart order bump pitch (under 12 words)",
  "whatsappMessage": "A friendly, high-touch WhatsApp recovery message for abandoned carts (under 30 words)"
}
Return only valid JSON.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        headline: `Add $15 more to unlock Free Priority Shipping!`,
        subtext: "Handcrafted orders ship same-day when completed in the next 15 minutes.",
        urgencyBadge: "Only 3 items remaining in stock",
        upsellPitch: "Add our best-selling artisan care balm for an extra 15% off.",
        whatsappMessage: "Hello! We reserved your selected items with free shipping unlocked. Need any assistance completing your order?"
      };
    }

    return res.json({
      success: true,
      source: 'gemini_ai',
      suggestions: parsed
    });
  } catch (error: any) {
    console.error('Error generating AI copy:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate copy',
      fallback: {
        headline: "Add a little more to unlock Free Express Delivery!",
        subtext: "Your items are temporarily reserved. Complete checkout now.",
        urgencyBadge: "Selling fast — limited batch",
        upsellPitch: "Customers also loved this matching essential accessory.",
        whatsappMessage: "Hi there! Your cart is saved. Tap here to complete your order with free delivery."
      }
    });
  }
});

// Production or Dev Static Serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  // Vite dev server integration
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`WooPulse Pro by Tayyaba Akmal running on http://localhost:${port}`);
});
