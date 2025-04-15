
import React, { useState } from 'react';
import { Movie } from '@/types';
import { getMoviePosterUrl } from '@/services/movieService';
import { ThumbsUp, ThumbsDown, Star, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';
import MovieDetailDialog from './MovieDetailDialog';

interface MovieCardProps {
  movie: Movie;
  showActions?: boolean;
  onViewDetails?: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  showActions = true,
  onViewDetails
}) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const { 
    profile, 
    addLikedMovie, 
    addDislikedMovie, 
    addAvoidedMovie,
    removeLikedMovie, 
    removeDislikedMovie,
    removeAvoidedMovie
  } = useProfile();
  
  const isLiked = profile.likedMovies.some(m => m.id === movie.id);
  const isDisliked = profile.dislikedMovies.some(m => m.id === movie.id);
  const isAvoided = profile.avoidedMovies.some(m => m.id === movie.id);
  
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

  const handleAvoid = () => {
    if (isAvoided) {
      removeAvoidedMovie(movie.id);
    } else {
      addAvoidedMovie(movie);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(movie);
    } else {
      setShowDetails(true);
    }
  };
  
  return (
    <>
      <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-film-dark border border-border hover:shadow-lg transition-shadow">
        <div className="relative aspect-[2/3] overflow-hidden bg-muted cursor-pointer" onClick={handleViewDetails}>
          <img 
            src={getMoviePosterUrl(movie.poster_path)} 
            alt={movie.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          
          <div className="absolute top-2 right-2 rounded-full bg-black/70 p-1 text-white text-xs font-medium flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{movie.vote_average?.toFixed(1) || "N/A"}</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold mb-1 line-clamp-1 cursor-pointer hover:text-film-primary" onClick={handleViewDetails}>
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
          </p>
          
          <p className="text-sm line-clamp-2 h-10 mb-3">{movie.overview || 'No description available.'}</p>
          
          {showActions && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLike}
                  className={cn(isLiked && "text-green-600")}
                  title="Like"
                >
                  <ThumbsUp className={cn("h-5 w-5", isLiked && "fill-green-600")} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDislike}
                  className={cn(isDisliked && "text-red-600")}
                  title="Dislike"
                >
                  <ThumbsDown className={cn("h-5 w-5", isDisliked && "fill-red-600")} />
                </Button>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleAvoid}
                  className={cn(isAvoided && "text-orange-600")}
                  title="Avoid"
                >
                  <X className={cn("h-5 w-5", isAvoided && "fill-orange-600")} />
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleViewDetails}>
                <Info className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <MovieDetailDialog 
        movie={movie} 
        open={showDetails} 
        onOpenChange={setShowDetails} 
      />
    </>
  );
};

export default MovieCard;
