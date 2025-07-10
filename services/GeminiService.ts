
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key is not configured. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "" });
const model = 'gemini-2.5-flash-preview-04-17'; // Use the specified model

export const GeminiService = {
  async generateOfferDescription(keywords: string): Promise<string> {
    if (!API_KEY) {
      return "API Key not configured. Cannot generate description.";
    }
    try {
      const prompt = `Draft a professional and compelling offer request description based on these keywords: "${keywords}". The description should clearly state the need and invite detailed proposals. Keep it concise yet comprehensive, around 100-150 words.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        // config: { thinkingConfig: { thinkingBudget: 0 } } // For low latency, if needed
      });

      return response.text ?? "No description generated.";
    } catch (error) {
      console.error("Error generating description with Gemini:", error);
      if (error instanceof Error && error.message.includes("API key not valid")) {
        return "Error: The provided API Key is not valid. Please check your configuration.";
      }
      return "Failed to generate description. Please try again later.";
    }
  },
};
    