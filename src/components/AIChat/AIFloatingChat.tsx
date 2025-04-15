
import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { generateResponse } from '@/services/geminiService';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import AIChatMessage from './AIChatMessage';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';
import { getMovieDetails, searchMovies } from '@/services/movieService';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  movies?: Movie[];
}

const AIFloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your movie assistant. I can help you find movies and provide recommendations. Try asking me about specific movies or genres!",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useProfile();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Delayed scrolling to ensure content is rendered first
    const scrollTimer = setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 50);
    
    return () => clearTimeout(scrollTimer);
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await generateResponse(
        inputValue,
        profile,
        [...(profile?.likedMovies || []), ...(profile?.dislikedMovies || [])].slice(0, 5)
      );
      
      // Extract movie IDs from the response using regex
      const movieIdRegex = /\[MOVIE_ID:(\d+)\]/g;
      const movieIds = [...response.matchAll(movieIdRegex)].map(match => parseInt(match[1]));
      
      // Fetch movie details if any IDs were found
      let movies: Movie[] = [];
      if (movieIds.length > 0) {
        const moviePromises = movieIds.map(id => getMovieDetails(id));
        const movieDetails = await Promise.all(moviePromises);
        movies = movieDetails.filter((m): m is Movie => m !== null);
      }
      
      // Clean up the response by removing the movie ID tags
      const cleanResponse = response.replace(movieIdRegex, '');
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: cleanResponse,
        role: 'assistant',
        timestamp: new Date(),
        movies: movies.length > 0 ? movies : undefined
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <AIChatMessage message={message} />
              {message.movies && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {message.movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="self-start bg-muted rounded-lg rounded-tl-none p-3 max-w-[85%]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-3 sticky bottom-0 bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask about movies..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button 
            size="icon" 
            className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[80vh]">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Movie AI Assistant</h3>
            </div>
          </div>
          <ChatContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          size="icon" 
          className="h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {isOpen && (
        <div className="bg-background border rounded-lg shadow-xl flex flex-col w-[350px] md:w-[400px] h-[500px]">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Movie AI Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ChatContent />
        </div>
      )}
    </div>
  );
};

export default AIFloatingChat;
