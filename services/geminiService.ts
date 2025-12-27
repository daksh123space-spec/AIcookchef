
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { CourseType, DishSuggestion, Recipe } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDishSuggestions = async (ingredients: string[], course: CourseType): Promise<DishSuggestion[]> => {
  const ai = getAI();
  const prompt = `Based on these ingredients: ${ingredients.join(', ')}, suggest 4 creative ${course} dishes. 
  Only suggest dishes where these ingredients are central or easy to supplement with common pantry staples.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            prepTime: { type: Type.STRING },
            matchScore: { type: Type.NUMBER }
          },
          required: ["id", "title", "description", "difficulty", "prepTime", "matchScore"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const getRecipe = async (dishTitle: string, ingredients: string[]): Promise<Recipe> => {
  const ai = getAI();
  const prompt = `Create a detailed recipe for "${dishTitle}" using these primary ingredients: ${ingredients.join(', ')}. 
  Include specific measurements, step-by-step instructions, chef's tips, and basic nutritional info.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutritionalInfo: { type: Type.STRING }
        },
        required: ["title", "ingredients", "instructions", "tips", "nutritionalInfo"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateDishImage = async (dishTitle: string): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-end, professional food photography shot of ${dishTitle}. Beautiful plating, warm lighting, rustic kitchen background.` }]
    },
    config: {
      imageConfig: { aspectRatio: "16:9" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const createKitchenChat = (): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a world-class Michelin-star chef assistant. You help users with cooking techniques, ingredient substitutions, and general kitchen advice. Keep your tone encouraging, professional, and helpful.",
    }
  });
};
