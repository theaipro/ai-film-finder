import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { geminiService, GeminiService } from '@/services/geminiService';
import { MessageSquare, X, Send, Loader2, Maximize2, Minimize2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import AIChatMessage from './AIChatMessage';
import AIChatConfig from './AIChatConfig';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AIFloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your movie assistant. Ask me about movies, recommendations, or your preferences!",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [geminiInstance, setGeminiInstance] = useState<GeminiService | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { profile } = useProfile();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKeySet(true);
      setGeminiInstance(new GeminiService(savedApiKey));
    } else {
      setApiKeySet(true);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setApiKeySet(true);
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
      const service = geminiInstance || geminiService;
      
      const response = await service.generateResponse(
        inputValue,
        profile,
        [...(profile?.likedMovies || []), ...(profile?.dislikedMovies || [])].slice(0, 5)
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: "Chat cleared! How can I help you with movies today?",
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
  };

  const handleSaveApiKey = (apiKey: string) => {
    setApiKeySet(true);
    setGeminiInstance(new GeminiService(apiKey));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {!isOpen && (
        <Button 
          onClick={toggleChat} 
          size="icon" 
          className="h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {isOpen && (
        <div 
          className={`bg-background border rounded-lg shadow-xl flex flex-col ${
            isExpanded 
              ? 'fixed top-4 right-4 left-4 bottom-4 md:left-auto md:w-[500px]' 
              : 'w-[350px] md:w-[400px] h-[500px]'
          }`}
        >
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Movie AI Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsConfigOpen(true)} className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleExpand} className="h-8 w-8">
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <AIChatMessage key={message.id} message={message} />
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
          
          <form onSubmit={handleSubmit} className="border-t p-3">
            <div className="flex gap-2">
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
            </div>
            
            <div className="flex justify-between mt-2">
              <div className="ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs text-muted-foreground"
                >
                  Clear chat
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      <AIChatConfig
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={handleSaveApiKey}
        defaultApiKey={localStorage.getItem('gemini_api_key') || ''}
      />
    </div>
  );
};

export default AIFloatingChat;
