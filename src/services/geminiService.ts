
import axios from "axios";

// Fixed API key and model name based on requirements
const API_KEY = "AIzaSyAVtTCBB2yyrUYOPKEObuiH2qRXLrQpZqQ";
const MODEL = "gemini-2.0-flash";

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string) {
    // If no API key is provided, use the default one
    this.apiKey = apiKey || API_KEY;
    this.model = MODEL;
  }

  async generateResponse(prompt: string, profile?: any, movieContext?: any[]): Promise<string> {
    try {
      // Create a more comprehensive system prompt using the profile and movie context if available
      let systemPrompt = "You are a helpful assistant that provides information about movies.";
      
      if (profile) {
        systemPrompt += " The user's profile indicates they enjoy: " + 
          (profile.genres?.join(', ') || 'various genres') + 
          ". Their mood is: " + (profile.mood || 'not specified') + ".";
      }

      if (movieContext && movieContext.length > 0) {
        systemPrompt += " The user has previously interacted with these movies: " + 
          movieContext.map(movie => movie.title || 'unknown').join(', ') + ".";
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
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
  }
}

// Export a default instance with the fixed API key
export const geminiService = new GeminiService();

// For backward compatibility, also export the generateResponse function directly
export const generateResponse = async (prompt: string, systemPrompt?: string): Promise<string> => {
  return geminiService.generateResponse(prompt, null, null);
};
