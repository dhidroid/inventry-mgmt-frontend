
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization using named parameters and directly referencing process.env.API_KEY
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async extractInventoryFromImage(base64Image: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
