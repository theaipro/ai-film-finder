
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import MoodSelector from '@/components/MoodSelector';
import { useProfile } from '@/context/ProfileContext';
import { Mood as MoodType } from '@/types';

const Mood = () => {
  const navigate = useNavigate();
  const { profile, setCurrentMood } = useProfile();
  
  const handleMoodSelect = (mood: MoodType | undefined) => {
    setCurrentMood(mood);
  };
  
  const handleContinue = () => {
    navigate('/recommendations');
  };
  
  const handleSkip = () => {
    // Clear the current mood if skipping
    setCurrentMood(undefined);
    navigate('/recommendations');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">How are you feeling today?</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We'll tailor your recommendations based on your current mood
          </p>
          
          <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
            <MoodSelector 
              currentMood={profile.currentMood}
              onSelectMood={handleMoodSelect}
            />
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleSkip}
            >
              Use Tags Instead
            </Button>
            
            <Button 
              onClick={handleContinue}
              className="bg-film-primary hover:bg-film-primary/90 text-white"
            >
              Get Recommendations
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mood;
