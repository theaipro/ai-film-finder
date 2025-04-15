
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, User, Home } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { profile } = useProfile();
  const hasProfile = profile.likedMovies.length > 0 || profile.dislikedMovies.length > 0;

  return (
    <nav className="bg-film-dark text-film-light p-4 mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-film-primary" />
          <span className="text-xl font-bold">Film Fan Finder</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-1 hover:text-film-primary transition-colors">
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          
          <Link 
            to={hasProfile ? "/recommendations" : "/profile"} 
            className="flex items-center space-x-1 hover:text-film-primary transition-colors"
          >
            <User className="h-5 w-5" />
            <span>{hasProfile ? "Recommendations" : "Create Profile"}</span>
          </Link>
          
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
