
import React, { useState } from 'react';
import { Movie } from '@/types';
import { getMoviePosterUrl } from '@/services/movieService';
import { ThumbsUp, ThumbsDown, Star, Info, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';
import MovieDetailDialog from './MovieDetailDialog';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const { 
    profile, 
    addLikedMovie, 
    addDislikedMovie, 
    addAvoidedMovie,
    addWatchLaterMovie,
    removeLikedMovie, 
    removeDislikedMovie,
    removeAvoidedMovie,
    removeWatchLaterMovie
  } = useProfile();
  
  const isLiked = profile.likedMovies?.some(m => m.id === movie.id) || false;
  const isDisliked = profile.dislikedMovies?.some(m => m.id === movie.id) || false;
  const isAvoided = profile.avoidedMovies?.some(m => m.id === movie.id) || false;
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

  const handleAvoid = () => {
    if (isAvoided) {
      removeAvoidedMovie(movie.id);
    } else {
      addAvoidedMovie(movie);
    }
  };

  const handleWatchLater = () => {
    if (isWatchLater) {
      removeWatchLaterMovie(movie.id);
    } else {
      addWatchLaterMovie(movie);
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
      <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-film-dark border border-border hover:shadow-lg transition-shadow h-full flex flex-col">
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
        
        <div className="p-3 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-semibold mb-1 line-clamp-1 cursor-pointer hover:text-film-primary text-sm sm:text-base" onClick={handleViewDetails}>
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
          </p>
          
          <p className="text-xs sm:text-sm line-clamp-2 mb-3 flex-grow">{movie.overview || 'No description available.'}</p>
          
          {showActions && (
            <div className="flex items-center justify-between mt-auto">
              <div className={`flex ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "icon"} 
                  onClick={handleLike}
                  className={cn(isLiked && "text-green-600", isMobile && "p-1 h-auto")}
                  title="Like"
                >
                  <ThumbsUp className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-green-600")} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "icon"} 
                  onClick={handleDislike}
                  className={cn(isDisliked && "text-red-600", isMobile && "p-1 h-auto")}
                  title="Dislike"
                >
                  <ThumbsDown className={cn("h-4 w-4 sm:h-5 sm:w-5", isDisliked && "fill-red-600")} />
                </Button>

                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "icon"} 
                  onClick={handleAvoid}
                  className={cn(isAvoided && "text-orange-600", isMobile && "p-1 h-auto")}
                  title="Avoid"
                >
                  <X className={cn("h-4 w-4 sm:h-5 sm:w-5", isAvoided && "fill-orange-600")} />
                </Button>

                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "icon"} 
                  onClick={handleWatchLater}
                  className={cn(isWatchLater && "text-blue-600", isMobile && "p-1 h-auto")}
                  title="Watch Later"
                >
                  <Clock className={cn("h-4 w-4 sm:h-5 sm:w-5", isWatchLater && "fill-blue-600")} />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "sm"} 
                onClick={handleViewDetails}
                className={isMobile ? "text-xs px-2 py-1 h-auto" : ""}
              >
                <Info className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
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
