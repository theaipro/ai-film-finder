
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genre_ids?: number[];
  genres?: Genre[];
  vote_average: number;
  likabilityPercentage?: number;
  // Add additional properties as needed
}

export interface Genre {
  id: number;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  source: 'auto' | 'manual';
  type: string;
  occurrences?: number;
  dislikedOccurrences?: number;
  movieIds?: number[];
  dislikedMovieIds?: number[];
  confirmed?: boolean;
  override?: boolean;
  netScore?: number;
}

export type Mood = 'happy' | 'sad' | 'excited' | 'relaxed' | 'thoughtful' | 'tense';

export interface UserProfile {
  likedMovies: Movie[];
  dislikedMovies: Movie[];
  avoidedMovies: Movie[];
  watchLaterMovies: Movie[];
  likedTags: Tag[];
  confirmedTags: Tag[];
  avoidedTags: Tag[];
  currentMood?: Mood;
  name: string;
  bio: string;
  favoriteGenres: Genre[];
}
