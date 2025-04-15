
import axios from "axios";

// Fixed API key and model name based on requirements
const API_KEY = "AIzaSyAVtTCBB2yyrUYOPKEObuiH2qRXLrQpZqQ";
const MODEL = "gemini-2.0-flash";

export const generateResponse = async (prompt: string, systemPrompt?: string): Promise<string> => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          },
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt || "You are a helpful assistant that provides information about movies." }]
        },
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I couldn't process your request. Please try again later.";
  }
};
