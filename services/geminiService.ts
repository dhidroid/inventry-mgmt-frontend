
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private apiKey: string | undefined;
  private ai: GoogleGenAI | undefined;

  constructor() {
    // Only store the key, don't initialize immediately to prevent crash
    this.apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  }

  private getClient(): GoogleGenAI {
    if (!this.apiKey) {
      throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY or use the setup guide.");
    }
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
    return this.ai;
  }

  async extractInventoryFromImage(base64Image: string) {
    try {
      const client = this.getClient();
      const response = await client.models.generateContent({
        model: 'gemini-1.5-flash', // Updated to stable model
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: "Analyze this inventory sheet. Extract the product codes (e.g., B06, B07) and the numerical entries written in the grid. Map them to a structured JSON output.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productCode: { type: Type.STRING },
                    date: { type: Type.STRING, description: "The date or day column heading" },
                    count: { type: Type.NUMBER },
                  },
                  required: ['productCode', 'date', 'count'],
                },
              },
            },
            required: ['extractions'],
          },
        },
      });

      // Directly access .text property as it is a getter, not a method
      const jsonStr = response.text;
      return JSON.parse(jsonStr || '{}');
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      // Return empty structure instead of crashing
      return { extractions: [] };
    }
  }
}

export const geminiService = new GeminiService();
