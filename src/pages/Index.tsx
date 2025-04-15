
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Search, Tag, ThumbsUp, ThumbsDown, Smile, User, Heart, Star, Clock, Clapperboard, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useProfile } from '@/context/ProfileContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const isMobile = useIsMobile();
  const hasProfile = profile.likedMovies.length > 0 || profile.dislikedMovies.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-film-dark text-white py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-film-primary via-white to-film-accent bg-clip-text text-transparent">
                Film Fan Finder
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Discover movies tailored to your unique taste and current mood
              </p>

              {hasProfile ? (
                <div>
                  <Button 
                    size="lg" 
                    className="bg-film-primary hover:bg-film-primary/90 text-white w-full md:w-auto"
                    onClick={() => navigate('/recommendations')}
                  >
                    Get Recommendations
                  </Button>
                  <p className="mt-4 text-sm text-gray-400">
                    Your profile already has {profile.likedMovies.length} liked movies and {profile.tags.length} tags
                    {profile.tags.filter(t => t.confirmed).length > 0 ? 
                      ` (${profile.tags.filter(t => t.confirmed).length} confirmed)` : 
                      ''}!
                  </p>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-film-primary hover:bg-film-primary/90 text-white w-full md:w-auto"
                  onClick={() => navigate('/profile')}
                >
                  Create Your Profile
                </Button>
              )}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md">
                <img 
                  src="/lovable-uploads/a89b4d5e-83ef-4c41-bcd7-36b361b81dc6.png" 
                  alt="Movie recommendations" 
                  className="rounded-lg shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Film Fan Finder Works</h2>
            <p className="text-lg text-muted-foreground">
              Finding your perfect movie match in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-film-tag flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="h-8 w-8 text-film-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate Movies</h3>
              <p className="text-muted-foreground">
                Tell us what movies you like and dislike to help us understand your taste.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-film-tag flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-film-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalize Tags</h3>
              <p className="text-muted-foreground">
                We generate tags based on your choices. Fine-tune them to improve your recommendations.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-film-tag flex items-center justify-center mx-auto mb-4">
                <Smile className="h-8 w-8 text-film-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Match Your Mood</h3>
              <p className="text-muted-foreground">
                Select how you're feeling and we'll suggest the perfect movies for your current mood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Screenshots */}
      <section className="py-12 md:py-20 bg-film-light/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Discover Your Perfect Match</h2>
            <p className="text-lg text-muted-foreground">
              Our algorithm finds movies that match your unique preferences
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-4 rounded-lg shadow-md">
              <img 
                src="/lovable-uploads/a26d375f-7244-4807-a1cb-14a05f0d2af8.png" 
                alt="Mood selection" 
                className="rounded-lg shadow-inner w-full mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Match Your Current Mood</h3>
              <p className="text-muted-foreground">
                Select from six different moods to get personalized recommendations that match how you're feeling right now.
              </p>
            </div>
            
            <div className="bg-card p-4 rounded-lg shadow-md">
              <img 
                src="/lovable-uploads/f26ec43d-86f4-458d-9a64-37bb45070936.png" 
                alt="Personalized tags" 
                className="rounded-lg shadow-inner w-full mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Customize Your Preferences</h3>
              <p className="text-muted-foreground">
                Fine-tune your tags to ensure our recommendations perfectly match your taste in movies.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Movies Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-background to-film-dark/50">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Recommendations</h2>
            <p className="text-lg text-muted-foreground">
              Here's a peek at some of our most recommended films
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg group">
              <img 
                src="/lovable-uploads/444d9557-d3b2-47e8-ba30-8c762b537b51.png" 
                alt="Popular movies" 
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-white text-sm">6.2</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm md:text-base">In The Lost Lands</h4>
                </div>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg group">
              <img 
                src="/lovable-uploads/444d9557-d3b2-47e8-ba30-8c762b537b51.png" 
                alt="Popular movies" 
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-white text-sm">6.1</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm md:text-base">Minecraft Movie</h4>
                </div>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg group">
              <img 
                src="/lovable-uploads/444d9557-d3b2-47e8-ba30-8c762b537b51.png" 
                alt="Popular movies" 
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-white text-sm">6.3</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm md:text-base">G20</h4>
                </div>
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-lg group">
              <img 
                src="/lovable-uploads/444d9557-d3b2-47e8-ba30-8c762b537b51.png" 
                alt="Popular movies" 
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                <div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-white text-sm">6.8</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm md:text-base">Novocaine</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('/profile')} 
              className="bg-film-primary hover:bg-film-primary/90 text-white"
            >
              Start Building Your Profile
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="bg-film-tag rounded-full p-2 mr-4">
                    <User className="h-6 w-6 text-film-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Personalized Experience</h2>
                    <p className="text-muted-foreground">
                      Our algorithm learns from your preferences to deliver increasingly accurate recommendations over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="bg-film-tag rounded-full p-2 mr-4">
                    <Heart className="h-6 w-6 text-film-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Mood Matching</h2>
                    <p className="text-muted-foreground">
                      Whether you're feeling happy, sad, or adventurous, we'll find the perfect movie for your current state of mind.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="bg-film-tag rounded-full p-2 mr-4">
                    <Star className="h-6 w-6 text-film-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Quality Ratings</h2>
                    <p className="text-muted-foreground">
                      See movie ratings to help you make informed decisions about what to watch next.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="flex items-start mb-4">
                  <div className="bg-film-tag rounded-full p-2 mr-4">
                    <Clock className="h-6 w-6 text-film-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Watch Later</h2>
                    <p className="text-muted-foreground">
                      Save films to your watch later list so you never forget a great recommendation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-film-primary text-white">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Movie?</h2>
            <p className="text-xl mb-8">
              Create your profile and start getting personalized recommendations based on your preferences and mood.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-film-primary hover:bg-white/90 w-full md:w-auto"
              onClick={() => navigate('/profile')}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 bg-film-dark text-gray-400">
        <div className="container px-4 text-center">
          <p className="text-sm">
            Film Fan Finder uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
