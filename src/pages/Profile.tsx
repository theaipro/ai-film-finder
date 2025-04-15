
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, Search, AlertTriangle, Heart, ThumbsDown, X as XIcon, Tag as TagIcon, Compass } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import TagSelector from '@/components/TagSelector';
import TagQuestions from '@/components/TagQuestions';
import { useProfile } from '@/context/ProfileContext';
import { getPopularMovies, searchMovies, extractTagsFromMovies } from '@/services/movieService';
import { Movie, Tag as TagType } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, addTag, removeTag } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [showTagQuestions, setShowTagQuestions] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<TagType[]>([]);
  const isMobile = useIsMobile();
  
  // Load popular movies on initial render
  useEffect(() => {
    const loadPopularMovies = async () => {
      setLoading(true);
      const movies = await getPopularMovies();
      setPopularMovies(movies);
      setLoading(false);
    };
    
    loadPopularMovies();
  }, []);
  
  // Generate tags based on liked movies whenever they change
  useEffect(() => {
    const generateTags = async () => {
      if (profile.likedMovies.length > 0) {
        // Update: Pass an object with likedMovies and dislikedMovies properties
        const { likedTags, confirmedTags } = await extractTagsFromMovies({
          likedMovies: profile.likedMovies,
          dislikedMovies: profile.dislikedMovies
        });
        // Combine both sets of tags for suggested tags
        const mergedTags = [...confirmedTags];
        
        // Add liked tags that aren't already in confirmed tags
        likedTags.forEach(likedTag => {
          if (!confirmedTags.some(confirmedTag => confirmedTag.id === likedTag.id)) {
            mergedTags.push(likedTag);
          }
        });
        
        setSuggestedTags(mergedTags);
        
        // Show tag questions when user has liked at least 3 movies and hasn't seen the questions yet
        if (profile.likedMovies.length >= 3 && profile.tags.length === 0) {
          setShowTagQuestions(true);
        }
      }
    };
    
    generateTags();
  }, [profile.likedMovies]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearchPerformed(true);
    const results = await searchMovies(searchQuery);
    setSearchResults(results);
    setLoading(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleContinue = () => {
    if (profile.likedMovies.length > 0) {
      navigate('/mood');
    } else {
      // Show some validation message
    }
  };
  
  const handleSaveTags = (selectedTags: TagType[]) => {
    // First remove any existing tags
    profile.tags.forEach(tag => removeTag(tag.id));
    
    // Then add the selected tags
    selectedTags.forEach(tag => addTag(tag));
    
    setShowTagQuestions(false);
  };
  
  const handleMovieDetails = (movie: Movie) => {
    // In a more complete app, this would navigate to a movie details page
    window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Let's discover your movie preferences to personalize your recommendations
          </p>
          
          {showTagQuestions ? (
            <div className="bg-card rounded-lg shadow-md p-6 mb-8">
              <TagQuestions 
                suggestedTags={suggestedTags}
                existingTags={profile.tags}
                onSaveTags={handleSaveTags}
              />
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Search for movies you love, hate, or want to avoid</h2>
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Search for a movie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-grow"
                />
                <Button onClick={handleSearch} disabled={!searchQuery.trim() || loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              
              {profile.likedMovies.length > 0 && (
                <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                  <AlertDescription>
                    You've liked {profile.likedMovies.length} {profile.likedMovies.length === 1 ? 'movie' : 'movies'}! 
                    {profile.likedMovies.length >= 3 ? ' That\'s enough to start getting recommendations.' : ' We recommend liking at least 3 movies for better results.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {!showTagQuestions && (
            <Tabs defaultValue="discover" className="mb-8">
              <TabsList className="mb-4 flex overflow-x-auto scrollbar-none">
                {isMobile ? (
                  // Mobile tabs with icons
                  <>
                    <TabsTrigger value="discover" className="flex items-center gap-1">
                      <Compass className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Discover</span>
                    </TabsTrigger>
                    <TabsTrigger value="liked" className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Liked</span>
                      <span className="text-xs">({profile.likedMovies.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="disliked" className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Disliked</span>
                      <span className="text-xs">({profile.dislikedMovies.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="avoided" className="flex items-center gap-1">
                      <XIcon className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Avoided</span>
                      <span className="text-xs">({profile.avoidedMovies.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="tags" className="flex items-center gap-1">
                      <TagIcon className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only">Tags</span>
                      <span className="text-xs">({profile.tags.length})</span>
                    </TabsTrigger>
                  </>
                ) : (
                  // Desktop tabs with text
                  <>
                    <TabsTrigger value="discover">Discover Movies</TabsTrigger>
                    <TabsTrigger value="liked">Liked ({profile.likedMovies.length})</TabsTrigger>
                    <TabsTrigger value="disliked">Disliked ({profile.dislikedMovies.length})</TabsTrigger>
                    <TabsTrigger value="avoided">Avoided ({profile.avoidedMovies.length})</TabsTrigger>
                    <TabsTrigger value="tags">Tags ({profile.tags.length})</TabsTrigger>
                  </>
                )}
              </TabsList>
              
              <TabsContent value="discover">
                <div className="mb-4">
                  {searchPerformed ? (
                    searchResults.length > 0 ? (
                      <h3 className="text-lg font-medium mb-4">Search Results</h3>
                    ) : (
                      <div className="text-center py-8">
                        <SearchX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No movies found</h3>
                        <p className="text-muted-foreground">Try a different search term</p>
                      </div>
                    )
                  ) : (
                    <h3 className="text-lg font-medium mb-4">Popular Movies</h3>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {loading ? (
                    // Placeholder loading state
                    Array(8).fill(null).map((_, index) => (
                      <div key={index} className="rounded-lg bg-muted animate-pulse h-[380px]"></div>
                    ))
                  ) : (
                    (searchPerformed ? searchResults : popularMovies).map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onViewDetails={handleMovieDetails}
                      />
                    ))
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="liked">
                {profile.likedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.likedMovies.map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onViewDetails={handleMovieDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg mb-4">You haven't liked any movies yet.</p>
                    <p className="text-muted-foreground mb-6">
                      Use the search to find movies you enjoy and give them a thumbs up!
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="disliked">
                {profile.dislikedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.dislikedMovies.map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onViewDetails={handleMovieDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg mb-4">You haven't disliked any movies yet.</p>
                    <p className="text-muted-foreground mb-6">
                      Let us know which movies you don't enjoy to improve your recommendations.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="avoided">
                {profile.avoidedMovies.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.avoidedMovies.map(movie => (
                      <MovieCard 
                        key={movie.id} 
                        movie={movie} 
                        onViewDetails={handleMovieDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg mb-4">You haven't added any movies to avoid yet.</p>
                    <p className="text-muted-foreground mb-6">
                      Mark movies you absolutely don't want to see in your recommendations.
                    </p>
                    <Alert variant="destructive" className="max-w-md mx-auto">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <AlertDescription>
                        Avoided movies will never show up in your recommendations, unlike disliked movies which may still influence your taste profile.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tags">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Your Preference Tags</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      These tags are generated based on your liked movies. You can add, remove, or customize tags to fine-tune your recommendations.
                    </p>
                    
                    <TagSelector 
                      tags={profile.tags}
                      onAddTag={addTag}
                      onRemoveTag={removeTag}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              onClick={handleContinue}
              disabled={profile.likedMovies.length === 0}
              className="bg-film-primary hover:bg-film-primary/90 text-white"
            >
              {profile.likedMovies.length === 0 
                ? "Like some movies to continue" 
                : "Continue to Mood Selection"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
