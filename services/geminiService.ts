
import { GoogleGenAI, Type } from "@google/genai";
import { Category, ExcuseResponse } from "../types.ts";

const getAI = () => {
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API_KEY is missing from environment variables. Check your deployment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateExcuse = async (category: Category, isDramatic: boolean): Promise<ExcuseResponse> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Generate a creative, humorous, and slightly absurd excuse for the following category: ${category}.
  ${isDramatic ? 'The excuse should be EXTRA dramatic, theatrical, and over-the-top.' : 'The excuse should be playful and relatable.'}
  
  Return the response as JSON with two fields:
  - "text": The excuse string.
  - "emoji": A single appropriate emoji.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ["text", "emoji"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      text: result.text || "My internet was eaten by a digital goat.",
      emoji: result.emoji || "🐐"
    };
  } catch (error: any) {
    console.error("Error generating excuse:", error);
    throw new Error(error.message || "Fabrication failed. Please try again.");
  }
};

export const explainHumor = async (excuse: string, category: string): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';
  
  const prompt = `You are a "Comedy Absurdity Analyst". 
  Explain in 2-3 short, witty, and humorous sentences why the following excuse for the category "${category}" is funny or ridiculous:
  "${excuse}"
  
  Keep the tone dry, analytical, yet hilarious. No preamble, just the explanation.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "The humor core is currently experiencing high latency.";
  } catch (error) {
    console.error("Error explaining humor:", error);
    return "The joke is so deep it transcended the digital plane of existence.";
  }
};
