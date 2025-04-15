import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Star, CalendarDays, Clock } from 'lucide-react';
import { Movie } from '@/types';
import { getMoviePosterUrl } from '@/services/movieService';
import { useProfile } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';

interface MovieDetailDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MovieDetailDialog: React.FC<MovieDetailDialogProps> = ({ movie, open, onOpenChange }) => {
  const { 
    profile, 
    addLikedMovie, 
    addDislikedMovie, 
    addWatchLaterMovie,
    removeLikedMovie, 
    removeDislikedMovie,
    removeWatchLaterMovie 
  } = useProfile();
  
  if (!movie) return null;
  
  // Add null checks for all arrays
  const isLiked = profile.likedMovies?.some(m => m.id === movie.id) || false;
  const isDisliked = profile.dislikedMovies?.some(m => m.id === movie.id) || false;
  const isWatchLater = profile.watchLaterMovies?.some(m => m.id === movie.id) || false;
  
  const handleLike = () => {
    if (isLiked) {
      removeLikedMovie(movie.id);
    } else {
      addLikedMovie(movie);
    }
  };
  
  const handleDislike = () => {
    if (isDisliked) {
      removeDislikedMovie(movie.id);
    } else {
      addDislikedMovie(movie);
    }
  };

  const handleWatchLater = () => {
    if (isWatchLater) {
      removeWatchLaterMovie(movie.id);
    } else {
      addWatchLaterMovie(movie);
    }
  };
  
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'Unknown';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{movie.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground">
              <CalendarDays className="h-3 w-3 mr-1" />
              {releaseYear}
            </Badge>
            
            {movie.vote_average && (
              <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-1">
            <div className="rounded-md overflow-hidden bg-muted">
              <img 
                src={getMoviePosterUrl(movie.poster_path)} 
                alt={movie.title} 
                className="w-full h-auto object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-muted-foreground mb-6">
              {movie.overview || 'No description available.'}
            </p>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                className={cn(
                  isLiked && "bg-green-600 hover:bg-green-700"
                )}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {isLiked ? "Liked" : "Like"}
              </Button>
              
              <Button 
                onClick={handleDislike}
                variant={isDisliked ? "default" : "outline"}
                className={cn(
                  isDisliked && "bg-red-600 hover:bg-red-700"
                )}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {isDisliked ? "Disliked" : "Dislike"}
              </Button>

              <Button 
                onClick={handleWatchLater}
                variant={isWatchLater ? "default" : "outline"}
                className={cn(
                  isWatchLater && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <Clock className="h-4 w-4 mr-2" />
                {isWatchLater ? "Added to Watch Later" : "Watch Later"}
              </Button>
              
              <Button 
                variant="outline" 
                className="ml-auto"
                onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank')}
              >
                More Info
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailDialog;
