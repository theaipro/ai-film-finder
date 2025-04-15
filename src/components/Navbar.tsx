
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Menu, X } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import ThemeToggle from './ThemeToggle';
import ProfileIcon from './ProfileIcon';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { profile } = useProfile();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const hasProfile = profile.likedMovies.length > 0 || profile.dislikedMovies.length > 0;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-film-dark text-film-light p-4 mb-0 relative z-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6 text-film-primary" />
          <span className="text-xl font-bold">Film Fan Finder</span>
        </Link>
        
        {isMobile ? (
          <>
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="text-film-light">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            {menuOpen && (
              <div className="fixed inset-0 top-[72px] bg-film-dark z-10 p-4 flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 p-3 hover:bg-film-dark/50 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                
                <Link 
                  to={hasProfile ? "/recommendations" : "/profile"}
                  className="flex items-center space-x-2 p-3 hover:bg-film-dark/50 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  <Film className="h-5 w-5" />
                  <span>{hasProfile ? "Recommendations" : "Create Profile"}</span>
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 p-3 hover:bg-film-dark/50 rounded-md"
                  onClick={() => setMenuOpen(false)}
                >
                  <ProfileIcon />
                  <span>Profile</span>
                </Link>
                
                <div className="flex items-center space-x-2 p-3">
                  <ThemeToggle />
                  <span>Toggle Theme</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-1 hover:text-film-primary transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            
            <Link 
              to={hasProfile ? "/recommendations" : "/profile"} 
              className="flex items-center space-x-1 hover:text-film-primary transition-colors"
            >
              <Film className="h-5 w-5" />
              <span>{hasProfile ? "Recommendations" : "Create Profile"}</span>
            </Link>
            
            <ThemeToggle />
            
            <ProfileIcon />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
