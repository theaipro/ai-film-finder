
import { Movie } from '@/types';
import axios from 'axios';

// This is a public API key for demo purposes only
// In a production app, you would store this securely
const API_KEY = '2dca580c2a14b55200e784d157207b4d';
const BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  }
});

/**
 * Get keywords for a specific movie from TMDB
 */
export const getMovieKeywords = async (movieId: number): Promise<string[]> => {
  try {
    const response = await api.get(`/movie/${movieId}/keywords`);
    
    if (response.data && response.data.keywords) {
      return response.data.keywords.map((keyword: any) => keyword.name);
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching keywords for movie ID ${movieId}:`, error);
    return [];
  }
};

/**
 * Batch function to get keywords for multiple movies
 * Note: This makes multiple API calls, so use sparingly
 */
export const getMoviesKeywords = async (movies: Movie[]): Promise<Record<number, string[]>> => {
  const keywordMap: Record<number, string[]> = {};
  
  // Process movies in small batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchResults = await Promise.all(
      batch.map(movie => getMovieKeywords(movie.id)
        .then(keywords => ({ id: movie.id, keywords }))
        .catch(() => ({ id: movie.id, keywords: [] }))
      )
    );
    
    // Add results to map
    batchResults.forEach(result => {
      keywordMap[result.id] = result.keywords;
    });
    
    // Small delay to avoid rate limits
    if (i + batchSize < movies.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return keywordMap;
};

/**
 * Calculate the net score for a tag based on liked and disliked occurrences
 * Disliked tags are weighted twice as heavy as liked tags
 */
export const calculateTagNetScore = (occurrences: number = 0, dislikedOccurrences: number = 0): number => {
  return occurrences - (dislikedOccurrences * 2);
};
