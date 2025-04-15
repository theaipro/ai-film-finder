
import axios from 'axios';
import { UserProfile, Movie } from '@/types';

interface GeminiRequestMessage {
  role: 'user' | 'model';
  parts: {
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }[];
}

interface GeminiRequest {
  contents: GeminiRequestMessage[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    index: number;
  }[];
  promptFeedback: {
    blockReason?: string;
  };
}

export class GeminiService {
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  constructor(private apiKey: string = '') {}
  
  async generateResponse(
    prompt: string, 
    userProfile?: UserProfile,
    recentMovies?: Movie[]
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        return "Please set a Gemini API key in the settings to use this feature.";
      }
      
      // Create system prompt with context about TMDB and user preferences
      let systemPrompt = "You are a helpful movie recommendation assistant with access to TMDB data. ";
      
      // Add user profile information if available
      if (userProfile) {
        systemPrompt += "Here's information about the user: ";
        systemPrompt += `Liked genres: ${userProfile.favoriteGenres?.join(', ') || 'None specified'}. `;
        systemPrompt += `Current mood: ${userProfile.currentMood || 'Not specified'}. `;
        systemPrompt += `Liked movies: ${userProfile.likedMovies.map(m => m.title).join(', ') || 'None'}. `;
        systemPrompt += `Disliked movies: ${userProfile.dislikedMovies.map(m => m.title).join(', ') || 'None'}. `;
        systemPrompt += `Avoided movies: ${userProfile.avoidedMovies.map(m => m.title).join(', ') || 'None'}. `;
        
        // Add tags information
        if (userProfile.tags && userProfile.tags.length > 0) {
          systemPrompt += `Tags the user likes: ${userProfile.tags.map(t => t.name).join(', ')}. `;
        }
      }
      
      // Add recent movies context if available
      if (recentMovies && recentMovies.length > 0) {
        systemPrompt += "Recent movies discussed: ";
        systemPrompt += recentMovies.map(movie => 
          `${movie.title} (${movie.release_date?.substring(0, 4) || 'N/A'}) - ${movie.overview?.substring(0, 100)}...`
        ).join('; ');
      }
      
      const messages: GeminiRequestMessage[] = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];
      
      const request: GeminiRequest = {
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024
        }
      };
      
      const response = await axios.post<GeminiResponse>(
        `${this.baseUrl}?key=${this.apiKey}`,
        request
      );
      
      if (response.data.promptFeedback?.blockReason) {
        return `Sorry, I couldn't respond to that: ${response.data.promptFeedback.blockReason}`;
      }
      
      if (response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      return "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return "Invalid API key or request. Please check your API key in the settings.";
      }
      return "Sorry, I encountered an error while processing your request.";
    }
  }
  
  // Example method to fetch movie recommendations based on user input
  async getMovieRecommendations(query: string, userProfile?: UserProfile): Promise<string> {
    const prompt = `Based on the user's profile and preferences, recommend some movies related to: ${query}. Provide 3-5 suggestions with brief explanations.`;
    return this.generateResponse(prompt, userProfile);
  }
}

// Create a default instance with no API key
export const geminiService = new GeminiService();
