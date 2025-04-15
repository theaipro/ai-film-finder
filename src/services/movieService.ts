
// Get recommendations based on tags and liked movies with likability percentage
export const getTagBasedRecommendations = async (
  tags: Tag[],
  likedMovieIds: number[],
  dislikedMovieIds: number[],
  avoidedMovieIds: number[] = [],
  avoidedTags: Tag[] = [],
  page = 1
): Promise<Movie[]> => {
  try {
    if (!Array.isArray(tags)) {
      console.warn('tags is not an array in getTagBasedRecommendations');
      return [];
    }
    
    // Separate tags by confirmation status
    const confirmedTags = tags.filter(tag => tag.confirmed);
    const likedTags = tags.filter(tag => !tag.confirmed);
    
    // Track avoided genre IDs
    const avoidedGenreIds = Array.isArray(avoidedTags) 
      ? avoidedTags
          .filter(tag => tag.type === 'genre')
          .map(tag => parseInt(tag.id.replace('genre-', '')))
          .filter(id => !isNaN(id))
      : [];
    
    // Extract genre IDs from all tags, applying weights
    // Confirmed tags get double weight
    const genreWeights: Record<number, number> = {};
    
    // Process confirmed tags with double weight
    confirmedTags
      .filter(tag => tag.type === 'genre')
      .forEach(tag => {
        const genreId = parseInt(tag.id.replace('genre-', ''));
        if (!isNaN(genreId) && !avoidedGenreIds.includes(genreId)) {
          // Confirmed tags get double weight
          genreWeights[genreId] = (genreWeights[genreId] || 0) + (tag.occurrences || 1) * 2;
        }
      });
    
    // Process liked tags with normal weight
    likedTags
      .filter(tag => tag.type === 'genre')
      .forEach(tag => {
        const genreId = parseInt(tag.id.replace('genre-', ''));
        if (!isNaN(genreId) && !avoidedGenreIds.includes(genreId)) {
          // Liked tags get normal weight
          genreWeights[genreId] = (genreWeights[genreId] || 0) + (tag.occurrences || 1);
        }
      });
    
    // Collect keyword tags to use for keyword-based search
    // This is especially useful when we don't have enough genre data
    const keywordTags = tags
      .filter(tag => tag.type === 'keyword' && 
              !avoidedTags.some(avoided => avoided.id === tag.id))
      .sort((a, b) => {
        // Sort by confirmed status first, then by occurrences
        if (a.confirmed && !b.confirmed) return -1;
        if (!a.confirmed && b.confirmed) return 1;
        return (b.occurrences || 0) - (a.occurrences || 0);
      })
      .slice(0, 5); // Take top 5 keywords
    
    // Get the top weighted genres
    const topGenreIds = Object.entries(genreWeights)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 5) // Limit to top 5 genres for better API results
      .map(entry => Number(entry[0]));
    
    // Build API calls based on available data
    const apiCalls = [];
    
    // 1. Genre-based API call
    if (topGenreIds.length > 0) {
      const genreParams = {
        page,
        sort_by: 'popularity.desc',
        with_genres: topGenreIds.join(',')
      };
      apiCalls.push(api.get('/discover/movie', { params: genreParams }));
    }
    
    // 2. Keyword-based API calls - one per keyword for better results
    for (const keyword of keywordTags) {
      // Extract the keyword name from the tag
      const keywordName = keyword.name;
      
      const keywordParams = {
        page,
        sort_by: 'popularity.desc',
        query: keywordName,
        include_adult: false
      };
      apiCalls.push(api.get('/search/movie', { params: keywordParams }));
    }
    
    // If no API calls (no genres or keywords), return popular movies
    if (apiCalls.length === 0) {
      return getPopularMovies(page);
    }
    
    // Execute all API calls in parallel
    const responses = await Promise.all(apiCalls);
    
    // Combine results from all API calls and remove duplicates
    const seenMovieIds = new Set<number>();
    let allResults: Movie[] = [];
    
    responses.forEach(response => {
      if (response.data && response.data.results) {
        const uniqueMovies = response.data.results.filter((movie: Movie) => {
          if (seenMovieIds.has(movie.id)) {
            return false;
          }
          seenMovieIds.add(movie.id);
          return true;
        });
        allResults = [...allResults, ...uniqueMovies];
      }
    });
    
    // Filter out disliked and avoided movies
    if (dislikedMovieIds.length > 0 || avoidedMovieIds.length > 0) {
      allResults = allResults.filter(movie => 
        !dislikedMovieIds.includes(movie.id) && 
        !avoidedMovieIds.includes(movie.id)
      );
    }
    
    // Calculate likability percentage for each movie
    allResults = allResults.map(movie => {
      let likabilityScore = 0;
      let maxPossibleScore = 0;
      
      // Calculate score based on matching genres
      if (movie.genre_ids) {
        movie.genre_ids.forEach(genreId => {
          // If this genre is in our weights, add its weight to the score
          if (genreWeights[genreId]) {
            likabilityScore += genreWeights[genreId];
          }
          
          // Add to max possible score the highest weight in our system
          // This helps normalize the percentage
          maxPossibleScore += Math.max(...Object.values(genreWeights), 1);
        });
      }
      
      // Boost score based on keywords - if this movie comes from a keyword search
      // and it matches one of our top keywords
      if (keywordTags.length > 0) {
        // Matching with movie title and overview
        const movieText = `${movie.title} ${movie.overview}`.toLowerCase();
        
        keywordTags.forEach(tag => {
          const keywordWeight = tag.confirmed ? (tag.occurrences || 1) * 2 : (tag.occurrences || 1);
          if (movieText.includes(tag.name.toLowerCase())) {
            likabilityScore += keywordWeight * 2; // Double boost for direct matches
            maxPossibleScore += keywordWeight * 2;
          }
        });
      }
      
      // Calculate percentage, with a minimum of 50% as these are already recommended
      const likabilityPercentage = maxPossibleScore > 0 
        ? Math.min(100, Math.max(50, Math.round((likabilityScore / maxPossibleScore) * 100)))
        : 70; // Default if we can't calculate
      
      return {
        ...movie,
        likabilityPercentage
      };
    });
    
    // Sort by likability percentage (high to low)
    allResults.sort((a, b) => 
      (b.likabilityPercentage || 0) - (a.likabilityPercentage || 0)
    );
    
    return allResults;
  } catch (error) {
    console.error('Error fetching tag-based recommendations:', error);
    return [];
  }
};
