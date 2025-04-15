import axios from 'axios';
import { Movie, Genre, Tag, Mood } from '@/types';

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

export const searchMovies = async (query: string, page = 1): Promise<Movie[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await api.get('/search/movie', {
      params: { query, page }
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const response = await api.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    return null;
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await api.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const getRecommendations = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await api.get(`/movie/${movieId}/recommendations`);
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching recommendations for movie ID ${movieId}:`, error);
    return [];
  }
};

// Utility to generate movie poster URL
export const getMoviePosterUrl = (posterPath: string | null, size = 'w500'): string => {
  if (!posterPath) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

// Updated function to extract tags from movies with improved confidence calculation
// Change the parameter to accept an object with likedMovies and dislikedMovies
export const extractTagsFromMovies = async ({
  likedMovies,
  dislikedMovies = []
}: {
  likedMovies: Movie[];
  dislikedMovies?: Movie[];
}): Promise<{
  likedTags: Tag[], 
  confirmedTags: Tag[]
}> => {
  // Get all genres first
  const genres = await getGenres();
  
  // Collect all genre IDs from the movies and the movies that contain them
  const genreMap = new Map<number, Set<number>>();
  const dislikedGenreMap = new Map<number, Set<number>>();
  
  // Process liked movies
  likedMovies.forEach(movie => {
    if (movie.genre_ids) {
      movie.genre_ids.forEach(genreId => {
        const movieIds = genreMap.get(genreId) || new Set<number>();
        movieIds.add(movie.id);
        genreMap.set(genreId, movieIds);
      });
    } else if (movie.genres) {
      movie.genres.forEach(genre => {
        const movieIds = genreMap.get(genre.id) || new Set<number>();
        movieIds.add(movie.id);
        genreMap.set(genre.id, movieIds);
      });
    }
  });
  
  // Process disliked movies
  dislikedMovies.forEach(movie => {
    if (movie.genre_ids) {
      movie.genre_ids.forEach(genreId => {
        const movieIds = dislikedGenreMap.get(genreId) || new Set<number>();
        movieIds.add(movie.id);
        dislikedGenreMap.set(genreId, movieIds);
      });
    } else if (movie.genres) {
      movie.genres.forEach(genre => {
        const movieIds = dislikedGenreMap.get(genre.id) || new Set<number>();
        movieIds.add(movie.id);
        dislikedGenreMap.set(genre.id, movieIds);
      });
    }
  });
  
  // Create liked tags with occurrences and movie references
  const likedTags: Tag[] = Array.from(genreMap.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .map(([genreId, movieIdsSet]) => {
      const genre = genres.find(g => g.id === genreId);
      const occurrences = movieIdsSet.size;
      const movieIds = Array.from(movieIdsSet);
      
      // Count disliked occurrences for this genre
      const dislikedMovieIdsSet = dislikedGenreMap.get(genreId) || new Set<number>();
      const dislikedOccurrences = dislikedMovieIdsSet.size;
      const dislikedMovieIds = Array.from(dislikedMovieIdsSet);
      
      return {
        id: `genre-${genreId}`,
        name: genre?.name || 'Unknown Genre',
        source: 'auto',
        type: 'genre',
        occurrences,
        dislikedOccurrences,
        movieIds,
        dislikedMovieIds
      };
    });
  
  // Calculate threshold for confirmed tags
  const totalTags = likedTags.length;
  const threshold = totalTags <= 50 ? 2 : Math.ceil(totalTags * 0.05);
  
  // Filter confirmed tags based on threshold and net score
  const confirmedTags = likedTags
    // Only confirm tags where occurrences - (dislikedOccurrences * 2) is positive
    .filter(tag => {
      const netScore = (tag.occurrences || 0) - ((tag.dislikedOccurrences || 0) * 2);
      return netScore > 0 && (tag.occurrences || 0) >= threshold;
    })
    .map(tag => ({...tag, confirmed: true}));
  
  // TODO: In the future, we could add more tag types like:
  // - Keywords from TMDB
  // - Actors/directors
  // - Time periods
  // - Themes extracted from descriptions
  
  return {
    likedTags,
    confirmedTags
  };
};

// Map mood to genre combinations for recommendations
export const getMoodBasedRecommendations = async (mood: Mood, page = 1): Promise<Movie[]> => {
  try {
    let genreIds: number[] = [];
    
    // Map moods to genre IDs
    switch (mood) {
      case 'happy':
        genreIds = [35, 10751]; // Comedy, Family
        break;
      case 'sad':
        genreIds = [18, 10749]; // Drama, Romance
        break;
      case 'excited':
        genreIds = [28, 12, 878]; // Action, Adventure, Sci-Fi
        break;
      case 'relaxed':
        genreIds = [16, 35, 10751]; // Animation, Comedy, Family
        break;
      case 'thoughtful':
        genreIds = [99, 36, 18]; // Documentary, History, Drama
        break;
      case 'tense':
        genreIds = [27, 53, 9648]; // Horror, Thriller, Mystery
        break;
    }
    
    const genreParam = genreIds.join(',');
    
    const response = await api.get('/discover/movie', {
      params: {
        with_genres: genreParam,
        sort_by: 'popularity.desc',
        page
      }
    });
    
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching mood-based recommendations for ${mood}:`, error);
    return [];
  }
};

// Get recommendations based on tags and liked movies
export const getTagBasedRecommendations = async (
  tags: Tag[],
  likedMovieIds: number[],
  dislikedMovieIds: number[],
  avoidedMovieIds: number[] = [],
  avoidedTags: Tag[] = [],
  page = 1
): Promise<Movie[]> => {
  try {
    // Prioritize confirmed tags over regular tags
    const confirmedTags = tags.filter(tag => tag.confirmed);
    
    // If there are confirmed tags, use those preferentially
    const tagsToUse = confirmedTags.length > 0 ? confirmedTags : tags;
    
    // Track avoided genre IDs
    const avoidedGenreIds = avoidedTags
      .filter(tag => tag.type === 'genre')
      .map(tag => parseInt(tag.id.replace('genre-', '')))
      .filter(id => !isNaN(id));
    
    // Extract genre IDs from prioritized tags, excluding avoided genres
    const genreIds = tagsToUse
      .filter(tag => tag.type === 'genre')
      .map(tag => parseInt(tag.id.replace('genre-', '')))
      .filter(id => !isNaN(id) && !avoidedGenreIds.includes(id));
    
    // If no genre IDs or liked movies, return popular movies
    if (genreIds.length === 0 && likedMovieIds.length === 0) {
      return getPopularMovies(page);
    }
    
    // Construct parameters based on available data
    const params: Record<string, any> = {
      page,
      sort_by: 'popularity.desc'
    };
    
    if (genreIds.length > 0) {
      params.with_genres = genreIds.join(',');
    }
    
    // Get recommendations from the API
    const response = await api.get('/discover/movie', { params });
    let results = response.data.results;
    
    // Filter out disliked and avoided movies
    if (dislikedMovieIds.length > 0 || avoidedMovieIds.length > 0) {
      results = results.filter(movie => 
        !dislikedMovieIds.includes(movie.id) && 
        !avoidedMovieIds.includes(movie.id)
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching tag-based recommendations:', error);
    return [];
  }
};
