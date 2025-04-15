export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genres?: Genre[];
  genre_ids?: number[];
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
  | 'custom';

export interface Tag {
  id: string;
  name: string;
  source: 'auto' | 'manual';
  type: TagType;
  occurrences?: number;    // Number of times this tag appears in liked movies
  confirmed?: boolean;     // Whether this is a confirmed tag based on threshold
  override?: boolean;      // Whether the user has manually overridden the tag status
  movieIds?: number[];     // IDs of movies that contributed to this tag
}

export type TagStatus = 'liked' | 'confirmed' | 'avoided';

export type Mood = 'happy' | 'sad' | 'excited' | 'relaxed' | 'thoughtful' | 'tense';

export interface UserProfile {
  likedMovies: Movie[];
  dislikedMovies: Movie[];
  avoidedMovies: Movie[];  
  watchLaterMovies: Movie[];
  likedTags: Tag[];        // Tags collected from liked movies
  confirmedTags: Tag[];    // Tags that meet the frequency threshold
  avoidedTags: Tag[];      // Tags the user explicitly wants to avoid
  currentMood?: Mood;
  name?: string;
  bio?: string;
  favoriteGenres?: string[];
}
