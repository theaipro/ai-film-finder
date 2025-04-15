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
}

export type Mood = 'happy' | 'sad' | 'excited' | 'relaxed' | 'thoughtful' | 'tense';

export interface UserProfile {
  likedMovies: Movie[];
  dislikedMovies: Movie[];
  avoidedMovies: Movie[];  
  watchLaterMovies: Movie[]; // Added watch later
  tags: Tag[];
  currentMood?: Mood;
  name?: string;           // Added for profile info
  bio?: string;           // Added for profile info
  favoriteGenres?: string[]; // Added for profile info
}
