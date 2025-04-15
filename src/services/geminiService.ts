
import axios from "axios";

const API_KEY = "AIzaSyAVtTCBB2yyrUYOPKEObuiH2qRXLrQpZqQ";
const MODEL = "gemini-2.0-flash";

export const generateResponse = async (prompt: string, profile?: any, movieContext?: any[]): Promise<string> => {
  try {
    // Create a more comprehensive system prompt
    let systemPrompt = `You are a helpful movie assistant that provides information and recommendations about movies. 
    When referring to specific movies, ALWAYS include their TMDB ID in the format [MOVIE_ID:123] right after mentioning the movie title.
    For example: "I recommend watching The Dark Knight [MOVIE_ID:155] by Christopher Nolan."
    Keep responses concise and focused on movies.`;
    
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
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
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
};
