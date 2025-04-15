
import axios from "axios";
import { Movie } from "@/types";

const API_KEY = "AIzaSyAVtTCBB2yyrUYOPKEObuiH2qRXLrQpZqQ";
const MODEL = "gemini-2.0-flash";

export class GeminiService {
  private apiKey: string;
  private model: string;
  private movieApi: string = 'https://api.themoviedb.org/3';
  private tmdbApiKey: string = '2dca580c2a14b55200e784d157207b4d';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || API_KEY;
    this.model = MODEL;
  }

  private async searchMovies(query: string): Promise<Movie[]> {
    try {
      const response = await axios.get(`${this.movieApi}/search/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          query: query,
          language: 'en-US',
          page: 1,
          include_adult: false
        }
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }

  async generateResponse(prompt: string, profile?: any, movieContext?: any[]): Promise<string> {
    try {
      // If the prompt contains movie search intent, search for movies first
      const searchMatch = prompt.match(/(?:search|find|look for|show me) (?:the movie |movies about |the film )?(.*)/i);
      if (searchMatch) {
        const searchQuery = searchMatch[1];
        const movies = await this.searchMovies(searchQuery);
        if (movies.length > 0) {
          const movieResults = movies.slice(0, 3).map(movie => ({
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average
          }));
          
          // Format the response with movie cards
          return `Here are some movies I found:\n\n${JSON.stringify(movieResults)}\n\nWhat would you like to know about these movies?`;
        }
      }

      // Default response generation
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
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
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

export const geminiService = new GeminiService();

export const generateResponse = async (prompt: string, systemPrompt?: string): Promise<string> => {
  return geminiService.generateResponse(prompt, null, null);
};
