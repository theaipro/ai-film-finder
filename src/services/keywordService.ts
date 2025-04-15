

import { Movie, Tag } from '@/types';
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

/**
 * Word similarity groups for semantic matching
 * Each array contains words that should be considered similar meaning
 */
export const keywordSimilarityGroups: string[][] = [
  // Aliens & space related
  ['alien', 'extraterrestrial', 'alien invasion', 'space creature', 'ufo'],
  
  // Horror elements
  ['monster', 'creature', 'beast', 'mutant', 'abomination'],
  
  // Locations
  ['mine', 'mining', 'coal mine', 'abandoned mine', 'quarry'],
  ['mountain', 'mountains', 'mountainside', 'alpine', 'peak'],
  ['hospital', 'clinic', 'medical facility', 'sanatorium', 'asylum'],
  ['forest', 'woods', 'woodland', 'jungle', 'wilderness'],
  
  // Places
  ['colorado', 'denver', 'boulder', 'rocky mountains'],
  
  // Activities
  ['ski', 'skiing', 'ski lift', 'snowboarding', 'winter sports'],
  
  // States
  ['abandoned', 'deserted', 'derelict', 'forsaken', 'neglected'],
  
  // Add more semantic groups as needed
];

/**
 * Find the semantic group for a given keyword
 * @returns The representative tag (first item in the matching group) or the original keyword
 */
export const findSemanticMatch = (keyword: string): string => {
  // Normalize the keyword to lowercase for matching
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Look through all semantic groups
  for (const group of keywordSimilarityGroups) {
    // If the keyword is in this group
    if (group.some(term => normalizedKeyword.includes(term) || term.includes(normalizedKeyword))) {
      // Return the primary term (first in the group) as the normalized version
      return group[0];
    }
  }
  
  // If no match found, return the original keyword
  return keyword;
};

/**
 * Process keywords and apply semantic matching
 * @returns Array of semantically normalized tags
 */
export const processKeywordsToTags = (keywords: string[], movieId?: number): Tag[] => {
  // Track processed keywords to avoid duplicates
  const processedKeywords: Record<string, Tag> = {};
  
  keywords.forEach(keyword => {
    // Find semantic match for this keyword
    const semanticMatch = findSemanticMatch(keyword);
    
    // Create a unique ID for this tag based on the semantic match
    const tagId = `keyword-${semanticMatch.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (processedKeywords[tagId]) {
      // If we've already processed this semantic match, just increment occurrence
      processedKeywords[tagId].occurrences = (processedKeywords[tagId].occurrences || 0) + 1;
      
      // Add movie ID if provided
      if (movieId && processedKeywords[tagId].movieIds) {
        processedKeywords[tagId].movieIds.push(movieId);
      }
    } else {
      // Create a new tag for this semantic match
      processedKeywords[tagId] = {
        id: tagId,
        name: semanticMatch,
        source: 'auto',
        type: 'keyword',
        occurrences: 1,
        movieIds: movieId ? [movieId] : [],
      };
    }
  });
  
  // Convert the record to an array
  return Object.values(processedKeywords);
};

