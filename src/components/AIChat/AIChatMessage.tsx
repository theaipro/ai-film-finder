
import React from 'react';
import { cn } from '@/lib/utils';
import { UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatMessageProps {
  message: Message;
}

const AIChatMessage: React.FC<AIChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Format the message content with proper links and styling
  const formatContent = (content: string) => {
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${url}</a>`;
    });
    
    // Replace new lines with <br>
    const withLineBreaks = withLinks.replace(/\n/g, '<br />');
    
    return { __html: withLineBreaks };
  };
  
  return (
    <div
      className={cn(
        'flex gap-2 items-start',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <Avatar className={cn('h-8 w-8', isUser ? 'bg-primary' : 'bg-muted')}>
        <AvatarFallback>
          {isUser ? (
            'U'
          ) : (
            <UserCircle className="h-5 w-5" />
          )}
        </AvatarFallback>
      </Avatar>
      
      {/* Message bubble */}
      <div
        className={cn(
          'rounded-lg p-3 max-w-[85%]',
          isUser 
            ? 'bg-primary text-primary-foreground rounded-tr-none' 
            : 'bg-muted rounded-tl-none'
        )}
      >
        {/* Message content */}
        <div 
          className="text-sm"
          dangerouslySetInnerHTML={formatContent(message.content)}
        />
        
        {/* Timestamp */}
        <div className={cn(
          'text-xs mt-1',
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default AIChatMessage;
