
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres?: Genre[];
  genre_ids?: number[];
  likabilityPercentage?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export type TagType = 
  | 'genre' 
  | 'theme'
  | 'protagonist'
  | 'storytelling'
  | 'cinematic'
  | 'ending'
  | 'tone'
  | 'length'
  | 'era'
  | 'keyword'
  | 'actor'
  | 'director'
  | 'custom';

export interface Tag {
  id: string;
  name: string;
  source: 'auto' | 'manual';
  type: TagType;
  occurrences?: number;
  dislikedOccurrences?: number;
  netScore?: number;
  confirmed?: boolean;
  override?: boolean;
  movieIds?: number[];
  dislikedMovieIds?: number[];
}

export type TagStatus = 'liked' | 'confirmed' | 'avoided';

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
  name?: string;
  bio?: string;
  favoriteGenres?: string[];
  tags?: Tag[];
}
