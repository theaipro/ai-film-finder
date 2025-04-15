
import { Tag, Movie } from '@/types';

/**
 * Calculate the threshold for a tag to become confirmed
 * @param totalLikedTags Total number of liked tags
 * @returns The minimum occurrences needed for a tag to be confirmed
 */
export const calculateConfidenceThreshold = (totalLikedTags: number): number => {
  if (totalLikedTags <= 50) {
    return 2; // For ≤ 50 tags, need at least 2 occurrences
  } else {
    // For > 50 tags, need at least 5% of total (rounded up)
    return Math.ceil(totalLikedTags * 0.05);
  }
};

/**
 * Analyze a tag collection and return statistics
 */
export const analyzeTagCollection = (
  likedTags: Tag[], 
  confirmedTags: Tag[]
) => {
  const totalLikedTags = likedTags.length;
  const totalConfirmedTags = confirmedTags.length;
  const manuallyConfirmedTags = confirmedTags.filter(tag => tag.override).length;
  const autoConfirmedTags = totalConfirmedTags - manuallyConfirmedTags;
  const confidenceThreshold = calculateConfidenceThreshold(totalLikedTags);
  
  // Get most frequent tag types
  const tagTypeCounts: Record<string, number> = {};
  [...likedTags, ...confirmedTags].forEach(tag => {
    tagTypeCounts[tag.type] = (tagTypeCounts[tag.type] || 0) + 1;
  });
  
  // Sort tag types by frequency
  const tagTypes = Object.entries(tagTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));
  
  // Get highest occurrence tags
  const highOccurrenceTags = [...likedTags, ...confirmedTags]
    .filter(tag => tag.occurrences && tag.occurrences > 1)
    .sort((a, b) => (b.occurrences || 0) - (a.occurrences || 0))
    .slice(0, 5);
  
  return {
    summary: {
      totalLikedTags,
      totalConfirmedTags,
      manuallyConfirmedTags,
      autoConfirmedTags,
      confidenceThreshold
    },
    tagTypes,
    highOccurrenceTags
  };
};

/**
 * Predict which movies are most likely to match a user's taste based on tag confidence
 */
export const predictMovieMatch = (
  confirmedTags: Tag[],
  movie: Movie
): number => {
  let matchScore = 0;
  const movieGenreIds = movie.genre_ids || 
    (movie.genres ? movie.genres.map(g => g.id) : []);
  
  // For each confirmed tag that matches the movie, increase the match score
  confirmedTags.forEach(tag => {
    if (tag.type === 'genre') {
      const genreId = parseInt(tag.id.replace('genre-', ''));
      if (!isNaN(genreId) && movieGenreIds.includes(genreId)) {
        // Weight by occurrences if available
        matchScore += tag.occurrences || 1;
        // Bonus points for manually confirmed tags
        if (tag.override) {
          matchScore += 2;
        }
      }
    }
    // Later we could add keyword matching and other tag types
  });
  
  return matchScore;
};
