import { Movie, Tag, Genre } from '@/types';
import axios from 'axios';
import { processKeywordsToTags, getMoviesKeywords } from './keywordService';

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
 * Get popular movies from TMDB API
 */
export const getPopularMovies = async (page = 1): Promise<Movie[]> => {
  try {
    const response = await api.get('/movie/popular', {
      params: { page }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

/**
 * Search for movies by query
 */
export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  try {
    const response = await api.get('/search/movie', {
      params: {
        query,
        page,
        include_adult: false
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

/**
 * Get movie details including genres
 */
export const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const response = await api.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return null;
  }
};

/**
 * Get all available movie genres
 */
export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await api.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

/**
 * Generate movie poster URL from poster_path
 */
export const getMoviePosterUrl = (posterPath: string | null): string => {
  if (!posterPath) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

/**
 * Get recommendations based on mood
 */
export const getMoodBasedRecommendations = async (
  mood: string,
  page = 1
): Promise<Movie[]> => {
  try {
    // Map moods to genre combinations
    const moodGenreMap: Record<string, number[]> = {
      happy: [35, 10751, 12], // Comedy, Family, Adventure
      sad: [18, 10749], // Drama, Romance
      excited: [28, 12, 878], // Action, Adventure, Science Fiction
      relaxed: [35, 10751, 14], // Comedy, Family, Fantasy
      thoughtful: [18, 99, 36], // Drama, Documentary, History
      tense: [53, 27, 9648], // Thriller, Horror, Mystery
    };
    
    const genreIds = moodGenreMap[mood] || [28, 12]; // Default to Action/Adventure
    
    const response = await api.get('/discover/movie', {
      params: {
        with_genres: genreIds.join(','),
        sort_by: 'popularity.desc',
        page
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error fetching mood recommendations:', error);
    return [];
  }
};

/**
 * Extract tags from liked and disliked movies
 */
export const extractTagsFromMovies = async ({
  likedMovies,
  dislikedMovies
}: {
  likedMovies: Movie[],
  dislikedMovies: Movie[]
}): Promise<{ likedTags: Tag[], confirmedTags: Tag[] }> => {
  // Ensure we have arrays to work with
  const safelikedMovies = Array.isArray(likedMovies) ? likedMovies : [];
  const safeDislikedMovies = Array.isArray(dislikedMovies) ? dislikedMovies : [];
  
  // Get all unique genres from liked movies
  const genreTags: Record<string, Tag> = {};
  const threshold = Math.max(2, Math.ceil(safelikedMovies.length * 0.3)); // 30% threshold or at least 2 movies
  
  // Get keywords for all liked movies
  const keywordMap = await getMoviesKeywords(safelikedMovies);
  
  // Process liked movies for genre tags
  for (const movie of safelikedMovies) {
    // Process genre tags
    if (movie.genres) {
      // If movie has full genre objects
      for (const genre of movie.genres) {
        const tagId = `genre-${genre.id}`;
        if (!genreTags[tagId]) {
          genreTags[tagId] = {
            id: tagId,
            name: genre.name,
            type: 'genre',
            source: 'auto',
            occurrences: 1,
            dislikedOccurrences: 0,
            movieIds: [movie.id],
            dislikedMovieIds: []
          };
        } else {
          genreTags[tagId].occurrences = (genreTags[tagId].occurrences || 0) + 1;
          if (genreTags[tagId].movieIds) {
            genreTags[tagId].movieIds.push(movie.id);
          } else {
            genreTags[tagId].movieIds = [movie.id];
          }
        }
      }
    } else if (movie.genre_ids) {
      // If movie only has genre IDs, fetch genre names from API
      const genreResponse = await getGenres();
      const genreMap = Object.fromEntries(
        genreResponse.map(genre => [genre.id, genre.name])
      );
      
      for (const genreId of movie.genre_ids) {
        const tagId = `genre-${genreId}`;
        const genreName = genreMap[genreId] || `Genre ${genreId}`;
        
        if (!genreTags[tagId]) {
          genreTags[tagId] = {
            id: tagId,
            name: genreName,
            type: 'genre',
            source: 'auto',
            occurrences: 1,
            dislikedOccurrences: 0,
            movieIds: [movie.id],
            dislikedMovieIds: []
          };
        } else {
          genreTags[tagId].occurrences = (genreTags[tagId].occurrences || 0) + 1;
          if (genreTags[tagId].movieIds) {
            genreTags[tagId].movieIds.push(movie.id);
          } else {
            genreTags[tagId].movieIds = [movie.id];
          }
        }
      }
    }
    
    // Process keyword tags
    const movieKeywords = keywordMap[movie.id] || [];
    if (movieKeywords.length > 0) {
      const keywordTags = processKeywordsToTags(movieKeywords, movie.id);
      
      // Add these keyword tags to our collection
      for (const tag of keywordTags) {
        const existingTag = genreTags[tag.id];
        
        if (existingTag) {
          existingTag.occurrences = (existingTag.occurrences || 0) + (tag.occurrences || 1);
          if (existingTag.movieIds && tag.movieIds) {
            existingTag.movieIds = [...new Set([...existingTag.movieIds, ...tag.movieIds])];
          }
        } else {
          genreTags[tag.id] = tag;
        }
      }
    }
  }
  
  // Process disliked movies
  for (const movie of safeDislikedMovies) {
    // Process genre tags for disliked movies
    if (movie.genres) {
      for (const genre of movie.genres) {
        const tagId = `genre-${genre.id}`;
        if (!genreTags[tagId]) {
          genreTags[tagId] = {
            id: tagId,
            name: genre.name,
            type: 'genre',
            source: 'auto',
            occurrences: 0,
            dislikedOccurrences: 1,
            movieIds: [],
            dislikedMovieIds: [movie.id]
          };
        } else {
          genreTags[tagId].dislikedOccurrences = (genreTags[tagId].dislikedOccurrences || 0) + 1;
          if (genreTags[tagId].dislikedMovieIds) {
            genreTags[tagId].dislikedMovieIds.push(movie.id);
          } else {
            genreTags[tagId].dislikedMovieIds = [movie.id];
          }
        }
      }
    } else if (movie.genre_ids) {
      const genreResponse = await getGenres();
      const genreMap = Object.fromEntries(
        genreResponse.map(genre => [genre.id, genre.name])
      );
      
      for (const genreId of movie.genre_ids) {
        const tagId = `genre-${genreId}`;
        const genreName = genreMap[genreId] || `Genre ${genreId}`;
        
        if (!genreTags[tagId]) {
          genreTags[tagId] = {
            id: tagId,
            name: genreName,
            type: 'genre',
            source: 'auto',
            occurrences: 0,
            dislikedOccurrences: 1,
            movieIds: [],
            dislikedMovieIds: [movie.id]
          };
        } else {
          genreTags[tagId].dislikedOccurrences = (genreTags[tagId].dislikedOccurrences || 0) + 1;
          if (genreTags[tagId].dislikedMovieIds) {
            genreTags[tagId].dislikedMovieIds.push(movie.id);
          } else {
            genreTags[tagId].dislikedMovieIds = [movie.id];
          }
        }
      }
    }
    
    // Process keyword tags for disliked movies
    const movieKeywords = keywordMap[movie.id] || [];
    if (movieKeywords.length > 0) {
      const keywordTags = processKeywordsToTags(movieKeywords, movie.id);
      
      // Add these keyword tags to our collection as disliked
      for (const tag of keywordTags) {
        const existingTag = genreTags[tag.id];
        
        if (existingTag) {
          existingTag.dislikedOccurrences = (existingTag.dislikedOccurrences || 0) + (tag.occurrences || 1);
          if (existingTag.dislikedMovieIds && tag.movieIds) {
            existingTag.dislikedMovieIds = [...new Set([
              ...(existingTag.dislikedMovieIds || []), 
              ...(tag.movieIds || [])
            ])];
          }
        } else {
          genreTags[tag.id] = {
            ...tag,
            occurrences: 0,
            dislikedOccurrences: tag.occurrences || 1,
            movieIds: [],
            dislikedMovieIds: tag.movieIds || []
          };
        }
      }
    }
  }
  
  // Convert to arrays and calculate which tags are confirmed
  const allTags = Object.values(genreTags);
  
  // Sort by number of occurrences (descending)
  const sortedTags = allTags.sort((a, b) => (b.occurrences || 0) - (a.occurrences || 0));
  
  // Separate confirmed vs liked tags
  const confirmedTags = sortedTags.filter(tag => 
    (tag.occurrences || 0) >= threshold && 
    (tag.dislikedOccurrences || 0) < (tag.occurrences || 0)
  );
  
  // Return all tags, but mark which ones are confirmed
  return {
    likedTags: sortedTags,
    confirmedTags: confirmedTags.map(tag => ({ ...tag, confirmed: true }))
  };
};

/**
 * Categorize tags by type for UI organization
 */
export const categorizeTagsByType = (tags: Tag[]): Record<string, Tag[][]> => {
  // Ensure tags is an array
  if (!Array.isArray(tags)) {
    console.warn('Tags is not an array in categorizeTagsByType');
    return {};
  }
  
  // Group tags by type
  const tagsByType: Record<string, Tag[]> = {};
  
  for (const tag of tags) {
    const type = tag.type || 'custom';
    if (!tagsByType[type]) {
      tagsByType[type] = [];
    }
    tagsByType[type].push(tag);
  }
  
  // For each type, group tags by semantic similarity
  const result: Record<string, Tag[][]> = {};
  
  Object.entries(tagsByType).forEach(([type, tagsOfType]) => {
    // Sort tags by occurrences
    const sortedTags = [...tagsOfType].sort((a, b) => 
      ((b.occurrences || 0) + (b.confirmed ? 5 : 0)) - 
      ((a.occurrences || 0) + (a.confirmed ? 5 : 0))
    );
    
    // For now, just put all tags in one group
    // In a future version, we could group by semantic similarity
    result[type] = [sortedTags];
  });
  
  return result;
};

/**
 * Group tags by weight (confirmed status and occurrences)
 * @param tags List of tags to group
 * @returns Tags grouped in weight tiers (higher weight = higher priority)
 */
export const groupTagsByWeight = (tags: Tag[]): Tag[][] => {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  
  // Calculate tag weights and sort
  const tagsWithWeight = tags.map(tag => ({
    ...tag,
    weight: (tag.confirmed ? 5 : 0) + (tag.occurrences || 1) + (tag.override ? 3 : 0)
  })).sort((a, b) => b.weight - a.weight);
  
  // Group into tiers
  const tiers: Tag[][] = [];
  let currentTier: Tag[] = [];
  let currentWeight = tagsWithWeight[0].weight;
  
  tagsWithWeight.forEach(tag => {
    if (Math.abs(tag.weight - currentWeight) > 2) {
      // Weight difference significant enough to create a new tier
      if (currentTier.length > 0) {
        tiers.push([...currentTier]);
        currentTier = [];
      }
      currentWeight = tag.weight;
    }
    currentTier.push(tag);
  });
  
  // Add the last tier if not empty
  if (currentTier.length > 0) {
    tiers.push(currentTier);
  }
  
  return tiers;
};

/**
 * Get recommendations based on tags with a cascading filter approach
 * Starts with highest weight tags and gradually relaxes constraints until enough movies are found
 */
export const getTagBasedRecommendations = async (
  tags: Tag[],
  likedMovieIds: number[] = [],
  dislikedMovieIds: number[] = [],
  avoidedMovieIds: number[] = [],
  avoidedTags: Tag[] = [],
  minResults: number = 6
): Promise<{ movies: Movie[], usedTiers: number }> => {
  try {
    console.log("Starting tag-based recommendations with", tags.length, "tags");
    
    // Group tags into tiers by weight
    const tagTiers = groupTagsByWeight(tags);
    console.log("Tags grouped into", tagTiers.length, "tiers");
    
    if (tagTiers.length === 0) {
      console.log("No tag tiers found, returning popular movies");
      const popularMovies = await getPopularMovies();
      return { 
        movies: popularMovies.filter(movie => 
          ![...likedMovieIds, ...dislikedMovieIds, ...avoidedMovieIds].includes(movie.id)
        ),
        usedTiers: 0 
      };
    }
    
    // Start with highest tier only, then gradually add more tiers until we have enough results
    let allUsedTags: Tag[] = [];
    let results: Movie[] = [];
    let usedTiers = 0;
    
    for (let i = 0; i < tagTiers.length; i++) {
      usedTiers = i + 1;
      // Accumulate tags up to this tier
      allUsedTags = tagTiers.slice(0, i + 1).flat();
      console.log(`Trying with ${allUsedTags.length} tags from ${i + 1} tiers`);
      
      // Extract genre and keyword tags
      const genreTags = allUsedTags.filter(tag => tag.type === 'genre');
      const keywordTags = allUsedTags.filter(tag => tag.type === 'keyword');
      
      // Prepare parameters for API request
      const genreIds = genreTags.map(tag => {
        const match = tag.id.match(/genre-(\d+)/);
        return match ? parseInt(match[1]) : NaN;
      }).filter(id => !isNaN(id));
      
      const keywordIds = keywordTags.map(tag => {
        const match = tag.id.match(/keyword-(\d+)/);
        return match ? parseInt(match[1]) : NaN;
      }).filter(id => !isNaN(id));
      
      // Prepare avoided genres and keywords
      const avoidedGenreIds = avoidedTags
        .filter(tag => tag.type === 'genre')
        .map(tag => {
          const match = tag.id.match(/genre-(\d+)/);
          return match ? parseInt(match[1]) : NaN;
        })
        .filter(id => !isNaN(id));
      
      const avoidedKeywordIds = avoidedTags
        .filter(tag => tag.type === 'keyword')
        .map(tag => {
          const match = tag.id.match(/keyword-(\d+)/);
          return match ? parseInt(match[1]) : NaN;
        })
        .filter(id => !isNaN(id));
      
      // Movies to exclude (liked, disliked, avoided)
      const excludeMovieIds = [...likedMovieIds, ...dislikedMovieIds, ...avoidedMovieIds];
      
      console.log("API request with:", {
        genreIds: genreIds.join(','),
        keywordIds: keywordIds.join('|'),
        avoidedGenreIds: avoidedGenreIds.join(','),
        avoidedKeywordIds: avoidedKeywordIds.join('|'),
        excludeCount: excludeMovieIds.length
      });
      
      // Make API request with current set of tags
      const response = await api.get('/discover/movie', {
        params: {
          with_genres: genreIds.length > 0 ? genreIds.join(',') : undefined,
          with_keywords: keywordIds.length > 0 ? keywordIds.join('|') : undefined,
          without_genres: avoidedGenreIds.length > 0 ? avoidedGenreIds.join(',') : undefined,
          without_keywords: avoidedKeywordIds.length > 0 ? avoidedKeywordIds.join('|') : undefined,
          without_id: excludeMovieIds.length > 0 ? excludeMovieIds.join('|') : undefined,
          sort_by: 'popularity.desc',
          page: 1
        }
      });
      
      results = response.data.results || [];
      console.log(`Found ${results.length} movies with ${i + 1} tiers`);
      
      // If we have enough results, stop adding tiers
      if (results.length >= minResults) {
        break;
      }
    }
    
    console.log(`Final results: ${results.length} movies using ${usedTiers} tiers`);
    return { movies: results, usedTiers };
    
  } catch (error) {
    console.error('Error fetching tag-based recommendations:', error);
    return { movies: [], usedTiers: 0 };
  }
};
