
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ThumbsDown, Bookmark, Tag, User } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProfileIcon = () => {
  const { profile } = useProfile();
  const hasProfile = profile.likedMovies.length > 0 || profile.dislikedMovies.length > 0;
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile.name) {
      return profile.name.split(' ')
        .map(part => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-film-primary focus:ring-offset-2">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-film-primary text-film-light">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.name || 'Your Profile'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.bio || (hasProfile ? 'Personalized recommendations' : 'Create your profile')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            {hasProfile && (
              <span className="ml-auto text-xs text-muted-foreground">
                Edit
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Liked Movies</span>
            {profile.likedMovies.length > 0 && (
              <span className="ml-auto text-xs font-medium">
                {profile.likedMovies.length}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <ThumbsDown className="mr-2 h-4 w-4" />
            <span>Disliked Movies</span>
            {profile.dislikedMovies.length > 0 && (
              <span className="ml-auto text-xs font-medium">
                {profile.dislikedMovies.length}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Watch Later</span>
            {profile.watchLaterMovies.length > 0 && (
              <span className="ml-auto text-xs font-medium">
                {profile.watchLaterMovies.length}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <Tag className="mr-2 h-4 w-4" />
            <span>Tags</span>
            {profile.confirmedTags.length > 0 && (
              <span className="ml-auto text-xs font-medium">
                {profile.confirmedTags.length} confirmed
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        
        {hasProfile && (
          <DropdownMenuItem asChild>
            <Link to="/recommendations" className="cursor-pointer">
              <Film className="mr-2 h-4 w-4" />
              <span>Recommendations</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileIcon;
