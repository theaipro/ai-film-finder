import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Tag as TagIcon, ThumbsUp, CirclePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import MoodSelector from '@/components/MoodSelector';
import LikabilityBadge from '@/components/LikabilityBadge';
import { useProfile } from '@/context/ProfileContext';
import { 
  getTagBasedRecommendations, 
  getMoodBasedRecommendations,
  getPopularMovies,
  categorizeTagsByType
} from '@/services/movieService';
import { Movie, Mood, Tag } from '@/types';
import { toast } from 'sonner';

const Recommendations = () => {
  const { profile, setCurrentMood } = useProfile();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [categorizedTags, setCategorizedTags] = useState<Record<string, Tag[][]>>({});
  
  useEffect(() => {
    if (profile.tags && profile.tags.length > 0) {
      setCategorizedTags(categorizeTagsByType(profile.tags));
    }
  }, [profile.tags]);
  
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      let movies: Movie[] = [];
      
      if (profile.currentMood) {
        movies = await getMoodBasedRecommendations(profile.currentMood);
      } else if (profile.tags && profile.tags.length > 0) {
        const likedMovieIds = profile.likedMovies ? profile.likedMovies.map(m => m.id) : [];
        const dislikedMovieIds = profile.dislikedMovies ? profile.dislikedMovies.map(m => m.id) : [];
        const avoidedMovieIds = profile.avoidedMovies ? profile.avoidedMovies.map(m => m.id) : [];
        
        const tagsForRecommendation = profile.tags;
        const avoidedTags = profile.avoidedTags || [];
        
        movies = await getTagBasedRecommendations(
          tagsForRecommendation,
          likedMovieIds,
          dislikedMovieIds,
          avoidedMovieIds,
          avoidedTags
        );
      } else {
        movies = await getPopularMovies();
      }
      
      if (movies && movies.length > 0) {
        const existingMovieIds = [
          ...(profile.likedMovies || []).map(m => m.id),
          ...(profile.dislikedMovies || []).map(m => m.id),
          ...(profile.avoidedMovies || []).map(m => m.id)
        ];
        
        const filteredMovies = movies.filter(movie => !existingMovieIds.includes(movie.id));
        setRecommendations(filteredMovies);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to fetch recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeMood = () => {
    setShowMoodSelector(!showMoodSelector);
  };
  
  const handleMoodSelect = (mood: Mood) => {
    setCurrentMood(mood);
    setShowMoodSelector(false);
  };
  
  const handleRefresh = () => {
    fetchRecommendations();
  };
  
  const handleMovieDetails = (movie: Movie) => {
    window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
  };
  
  const renderCategorizedTags = () => {
    const tagTypeLabels = {
      'genre': 'Genres',
      'theme': 'Themes',
      'tone': 'Tones',
      'custom': 'Custom Tags',
      'keyword': 'Keywords',
      'actor': 'Actors',
      'director': 'Directors'
    };
    
    const topCategories = Object.entries(categorizedTags).slice(0, 2);
    
    return (
      <div className="space-y-2">
        {topCategories.map(([type, groups]) => (
          <div key={type} className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {tagTypeLabels[type as keyof typeof tagTypeLabels] || type}:
            </span>
            
            {groups[0]?.map(tag => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className={tag.confirmed 
                  ? "bg-blue-200 dark:bg-blue-900/60 font-medium flex items-center gap-1"
                  : "bg-film-tag/50 flex items-center gap-1"
                }
                title={tag.confirmed 
                  ? `Confirmed tag (double weight, appears in ${tag.occurrences || 0} movies)` 
                  : `Regular tag (normal weight, appears in ${tag.occurrences || 0} movies)`
                }
              >
                {tag.name}
                {tag.confirmed && <CirclePercent className="h-3 w-3 ml-1 opacity-80" />}
              </Badge>
            ))}
            
            {groups.length > 1 && (
              <Badge variant="outline" className="bg-film-tag/50">
                +{groups.slice(1).reduce((count, group) => count + group.length, 0)} more
              </Badge>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Recommendations</h1>
              <p className="text-muted-foreground">
                {profile.currentMood 
                  ? `Movies for your ${profile.currentMood} mood` 
                  : 'Movies based on your preferences'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={handleChangeMood}>
                {profile.currentMood ? "Change Mood" : "Set Mood"}
              </Button>
              
              <Button onClick={handleRefresh} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {profile.currentMood && !showMoodSelector && (
            <Alert className="mb-6 bg-film-tag/50 border-film-primary/20">
              <div className="flex items-center">
                <Badge className="bg-film-primary text-white mr-2">
                  {profile.currentMood}
                </Badge>
                <AlertDescription>
                  Showing recommendations for your current mood. 
                </AlertDescription>
              </div>
            </Alert>
          )}
          
          {profile.tags && profile.tags.length > 0 && !profile.currentMood && (
            <Alert className="mb-6 bg-film-tag/50 border-film-primary/20">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-film-primary" />
                  <span className="text-sm font-medium">Based on your preferences:</span>
                </div>
                
                {renderCategorizedTags()}
              </div>
            </Alert>
          )}
          
          {showMoodSelector && (
            <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
              <MoodSelector 
                currentMood={profile.currentMood}
                onSelectMood={handleMoodSelect}
              />
            </div>
          )}
          
          {(!profile.likedMovies || profile.likedMovies.length === 0) && (
            <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900">
              <AlertDescription className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                You haven't liked any movies yet. Your recommendations might not be very personalized.
                <Button variant="link" className="ml-2" onClick={() => window.location.href = '/profile'}>
                  Add some favorites
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-8">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(null).map((_, index) => (
                  <div key={index} className="rounded-lg bg-muted animate-pulse h-[380px]"></div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendations.map(movie => (
                  <div key={movie.id} className="relative">
                    <MovieCard 
                      movie={movie} 
                      onViewDetails={handleMovieDetails}
                    />
                    {movie.likabilityPercentage && (
                      <div className="absolute top-2 right-2">
                        <LikabilityBadge percentage={movie.likabilityPercentage} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-medium mb-2">No recommendations found</p>
                <p className="text-muted-foreground mb-4">
                  Try changing your mood or adding more movies to your liked list.
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Film Fan Finder uses the TMDb API but is not endorsed or certified by TMDb.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
