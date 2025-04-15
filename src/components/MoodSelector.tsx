
import React from 'react';
import { Mood } from '@/types';
import { Smile, Frown, Zap, Coffee, Brain, Bomb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MoodSelectorProps {
  currentMood?: Mood;
  onSelectMood: (mood: Mood) => void;
}

interface MoodOption {
  value: Mood;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, onSelectMood }) => {
  const moods: MoodOption[] = [
    {
      value: 'happy',
      label: 'Happy',
      icon: <Smile className="h-6 w-6" />,
      description: 'Looking for something light and uplifting',
      color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60 dark:text-yellow-300'
    },
    {
      value: 'sad',
      label: 'Sad',
      icon: <Frown className="h-6 w-6" />,
      description: 'In the mood for something emotional',
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 dark:text-blue-300'
    },
    {
      value: 'excited',
      label: 'Excited',
      icon: <Zap className="h-6 w-6" />,
      description: 'Ready for adventure and thrills',
      color: 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/40 dark:hover:bg-red-900/60 dark:text-red-300'
    },
    {
      value: 'relaxed',
      label: 'Relaxed',
      icon: <Coffee className="h-6 w-6" />,
      description: 'Just want to chill and unwind',
      color: 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/40 dark:hover:bg-green-900/60 dark:text-green-300'
    },
    {
      value: 'thoughtful',
      label: 'Thoughtful',
      icon: <Brain className="h-6 w-6" />,
      description: 'Looking for something intellectually stimulating',
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-300'
    },
    {
      value: 'tense',
      label: 'Tense',
      icon: <Bomb className="h-6 w-6" />,
      description: 'Want something suspenseful and gripping',
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:hover:bg-orange-900/60 dark:text-orange-300'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">How are you feeling today?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select your current mood to get personalized movie recommendations.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {moods.map((mood) => (
          <Button
            key={mood.value}
            variant="outline"
            className={cn(
              "h-auto flex flex-col items-center justify-center p-4 transition-all",
              mood.color,
              currentMood === mood.value && "ring-2 ring-primary"
            )}
            onClick={() => onSelectMood(mood.value)}
          >
            <div className="mb-2">{mood.icon}</div>
            <span className="font-medium mb-1">{mood.label}</span>
            <span className="text-xs text-center">{mood.description}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
