
import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Tag as TagIcon, ThumbsUp, CirclePercent, Plus, Filter, CheckSquare, Square } from 'lucide-react';
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
  categorizeTagsByType,
  groupTagsByWeight
} from '@/services/movieService';
import { Movie, Mood, Tag } from '@/types';
import { toast } from 'sonner';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';

const Recommendations = () => {
  const { profile, setCurrentMood } = useProfile();
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [categorizedTags, setCategorizedTags] = useState<Record<string, Tag[][]>>({});
  const [usedTagTiers, setUsedTagTiers] = useState(0);
  const [totalTagTiers, setTotalTagTiers] = useState(0);
  const [canShowMore, setCanShowMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Ensure profile.tags is an array before calling categorizeTagsByType
    if (profile.tags && Array.isArray(profile.tags) && profile.tags.length > 0) {
      setCategorizedTags(categorizeTagsByType(profile.tags));
      
      // Calculate total available tag tiers
      const tagTiers = groupTagsByWeight(profile.tags);
      setTotalTagTiers(tagTiers.length);
    } else {
      setCategorizedTags({});
      setTotalTagTiers(0);
    }
  }, [profile.tags]);
  
  const fetchRecommendations = async (relaxConstraints = false, useSelectedTags = false) => {
    try {
      setLoading(true);
      let movies: Movie[] = [];
      
      if (profile.currentMood && !useSelectedTags) {
        movies = await getMoodBasedRecommendations(profile.currentMood);
        setUsedTagTiers(0);
        setCanShowMore(false);
      } else if ((profile.tags && Array.isArray(profile.tags) && profile.tags.length > 0) || 
                (useSelectedTags && selectedTags.length > 0)) {
        const likedMovieIds = Array.isArray(profile.likedMovies) ? profile.likedMovies.map(m => m.id) : [];
        const dislikedMovieIds = Array.isArray(profile.dislikedMovies) ? profile.dislikedMovies.map(m => m.id) : [];
        const avoidedMovieIds = Array.isArray(profile.avoidedMovies) ? profile.avoidedMovies.map(m => m.id) : [];
        
        const tagsForRecommendation = useSelectedTags && selectedTags.length > 0 ? selectedTags : profile.tags;
        const avoidedTags = Array.isArray(profile.avoidedTags) ? profile.avoidedTags : [];
        
        // If relaxing constraints, add more tiers
        const targetTiers = relaxConstraints ? usedTagTiers + 1 : 1;
        
        const result = await getTagBasedRecommendations(
          tagsForRecommendation,
          likedMovieIds,
          dislikedMovieIds,
          avoidedMovieIds,
          avoidedTags,
          6 // Target minimum of 6 results
        );
        
        movies = result.movies;
        setUsedTagTiers(result.usedTiers);
        
        // Can show more if we haven't used all tiers yet
        setCanShowMore(result.usedTiers < totalTagTiers);
      } else {
        movies = await getPopularMovies();
        setUsedTagTiers(0);
        setCanShowMore(false);
      }
      
      if (movies && movies.length > 0) {
        const existingMovieIds = [
          ...(Array.isArray(profile.likedMovies) ? profile.likedMovies.map(m => m.id) : []),
          ...(Array.isArray(profile.dislikedMovies) ? profile.dislikedMovies.map(m => m.id) : []),
          ...(Array.isArray(profile.avoidedMovies) ? profile.avoidedMovies.map(m => m.id) : [])
        ];
        
        const filteredMovies = movies.filter(movie => !existingMovieIds.includes(movie.id));
        
        if (relaxConstraints) {
          // Append to existing recommendations if relaxing constraints
          setRecommendations(prev => [...prev, ...filteredMovies]);
        } else {
          // Replace recommendations if doing a fresh search
          setRecommendations(filteredMovies);
        }
      } else if (!relaxConstraints) {
        // Only clear recommendations if not relaxing constraints
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to fetch recommendations. Please try again.");
      if (!relaxConstraints) {
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeMood = () => {
    setShowMoodSelector(!showMoodSelector);
  };
  
  const handleMoodSelect = (mood: Mood | undefined) => {
    setCurrentMood(mood);
    setShowMoodSelector(false);
    
    // Clear selected tags when changing mood
    setSelectedTags([]);
    
    if (!mood) {
      // If mood is cleared, fetch tag-based recommendations
      fetchRecommendations(false, false);
    }
  };
  
  const handleRefresh = () => {
    fetchRecommendations(false, selectedTags.length > 0); // Start fresh
  };
  
  const handleShowMore = () => {
    fetchRecommendations(true, selectedTags.length > 0); // Relax constraints
  };
  
  const handleMovieDetails = (movie: Movie) => {
    window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
  };
  
  const toggleTagSelection = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const handleTagBasedRecommendations = () => {
    fetchRecommendations(false, true);
    setIsFilterOpen(false);
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
              
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    {isMobile ? "" : "Filter by Tags"}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter by Tags</SheetTitle>
                    <SheetDescription>
                      Select specific tags to customize your recommendations
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-4">
                    {Object.entries(categorizedTags).map(([type, groups]) => (
                      <div key={type} className="space-y-2">
                        <h3 className="text-sm font-semibold capitalize">{type}s</h3>
                        <div className="flex flex-wrap gap-2">
                          {groups.flat().map(tag => (
                            <Button
                              key={tag.id}
                              variant="outline"
                              size="sm"
                              className={`flex items-center gap-1 ${
                                selectedTags.some(t => t.id === tag.id) 
                                  ? "bg-primary/20 border-primary" 
                                  : ""
                              }`}
                              onClick={() => toggleTagSelection(tag)}
                            >
                              {selectedTags.some(t => t.id === tag.id) ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                              {tag.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={handleTagBasedRecommendations}
                        disabled={selectedTags.length === 0}
                      >
                        Get Recommendations
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button onClick={handleRefresh} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <Alert className="mb-6 bg-film-tag/50 border-film-primary/20">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-film-primary" />
                  <span className="text-sm font-medium">Filtered by {selectedTags.length} tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <Badge 
                      key={tag.id}
                      variant="outline" 
                      className="bg-primary/20 border-primary flex items-center gap-1"
                    >
                      {tag.name}
                      <button 
                        onClick={() => toggleTagSelection(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </Alert>
          )}
          
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
          
          {profile.tags && Array.isArray(profile.tags) && profile.tags.length > 0 && !profile.currentMood && !selectedTags.length && (
            <Alert className="mb-6 bg-film-tag/50 border-film-primary/20">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-film-primary" />
                  <span className="text-sm font-medium">Based on your preferences:</span>
                  {usedTagTiers > 0 && (
                    <Badge variant="outline" className="ml-2 bg-blue-100 dark:bg-blue-900/30">
                      Using {usedTagTiers} of {totalTagTiers} tag tiers
                    </Badge>
                  )}
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
              
              {!profile.currentMood && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => {
                      setShowMoodSelector(false);
                      fetchRecommendations(false, selectedTags.length > 0);
                    }}
                    variant="outline"
                  >
                    Use Tags Instead
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {(!profile.likedMovies || !Array.isArray(profile.likedMovies) || profile.likedMovies.length === 0) && (
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
            {loading && !recommendations.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array(8).fill(null).map((_, index) => (
                  <div key={index} className="rounded-lg bg-muted animate-pulse h-[380px]"></div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <>
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
                
                {/* Show More button */}
                {canShowMore && !loading && (
                  <div className="flex justify-center mt-8">
                    <Button 
                      onClick={handleShowMore} 
                      variant="outline" 
                      className="w-full md:w-auto"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Show More Movies
                    </Button>
                  </div>
                )}
                
                {loading && (
                  <div className="flex justify-center mt-8">
                    <div className="rounded-lg bg-muted animate-pulse h-10 w-40"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg font-medium mb-2">No recommendations found</p>
                <p className="text-muted-foreground mb-4">
                  Try changing your mood, adding more movies to your liked list, or relaxing your tag filters.
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
