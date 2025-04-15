
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

export interface Tag {
  id: string;
  name: string;
  source: 'auto' | 'manual';
  type: 'genre' | 'theme' | 'tone' | 'custom';
}

export type Mood = 'happy' | 'sad' | 'excited' | 'relaxed' | 'thoughtful' | 'tense';

export interface UserProfile {
  likedMovies: Movie[];
  dislikedMovies: Movie[];
  tags: Tag[];
  currentMood?: Mood;
}
