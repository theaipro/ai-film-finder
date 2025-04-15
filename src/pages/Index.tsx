
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Search, Tag, ThumbsUp, ThumbsDown, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useProfile } from '@/context/ProfileContext';

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const hasProfile = profile.likedMovies.length > 0 || profile.dislikedMovies.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Film className="h-16 w-16 mx-auto mb-4 text-film-primary" />
            <h1 className="text-4xl font-bold mb-4">Film Fan Finder</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover movies tailored to your unique taste and current mood
            </p>

            {hasProfile ? (
              <div>
                <Button 
                  size="lg" 
                  className="bg-film-primary hover:bg-film-primary/90 text-white"
                  onClick={() => navigate('/recommendations')}
                >
                  Get Recommendations
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your profile already has {profile.likedMovies.length} liked movies and {profile.tags.length} tags
                  {profile.tags.filter(t => t.confirmed).length > 0 ? 
                    ` (${profile.tags.filter(t => t.confirmed).length} confirmed)` : 
                    ''}!
                </p>
              </div>
            ) : (
              <Button 
                size="lg" 
                className="bg-film-primary hover:bg-film-primary/90 text-white"
                onClick={() => navigate('/profile')}
              >
                Create Your Profile
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-4">
                <div className="bg-film-tag rounded-full p-2 mr-4">
                  <ThumbsUp className="h-6 w-6 text-film-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Tell Us What You Like</h2>
                  <p className="text-muted-foreground">
                    Add your favorite movies to help us understand your taste in films.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-4">
                <div className="bg-film-tag rounded-full p-2 mr-4">
                  <ThumbsDown className="h-6 w-6 text-film-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Tell Us What You Dislike</h2>
                  <p className="text-muted-foreground">
                    Let us know which movies didn't resonate with you to improve recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-4">
                <div className="bg-film-tag rounded-full p-2 mr-4">
                  <Tag className="h-6 w-6 text-film-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Fine-tune Your Tags</h2>
                  <p className="text-muted-foreground">
                    We'll generate tags based on your preferences, but you can customize them to make recommendations even better.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex items-start mb-4">
                <div className="bg-film-tag rounded-full p-2 mr-4">
                  <Smile className="h-6 w-6 text-film-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Match Your Mood</h2>
                  <p className="text-muted-foreground">
                    Tell us how you're feeling and we'll suggest the perfect movie for your current mood.
                  </p>
                </div>
              </div>
            </div>
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

export default Index;
