
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie, Tag, Mood, UserProfile } from '@/types';
import { extractTagsFromMovies } from '@/services/movieService';
import { calculateTagNetScore } from '@/services/keywordService';

interface ProfileContextType {
  profile: UserProfile;
  addLikedMovie: (movie: Movie) => void;
  removeLikedMovie: (movieId: number) => void;
  addDislikedMovie: (movie: Movie) => void;
  removeDislikedMovie: (movieId: number) => void;
  addAvoidedMovie: (movie: Movie) => void;
  removeAvoidedMovie: (movieId: number) => void;
  addWatchLaterMovie: (movie: Movie) => void;
  removeWatchLaterMovie: (movieId: number) => void;
  
  // New tag functions
  addLikedTag: (tag: Tag) => void;
  removeLikedTag: (tagId: string) => void;
  addConfirmedTag: (tag: Tag) => void;
  removeConfirmedTag: (tagId: string) => void;
  addAvoidedTag: (tag: Tag) => void;
  removeAvoidedTag: (tagId: string) => void;
  updateConfirmedTags: () => void;
  promoteTagToConfirmed: (tagId: string) => void;
  demoteTagFromConfirmed: (tagId: string) => void;
  
  // Legacy tag functions for backward compatibility
  addTag: (tag: Tag) => void;
  removeTag: (tagId: string) => void;
  
  setCurrentMood: (mood: Mood) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const initialProfile: UserProfile = {
  likedMovies: [],
  dislikedMovies: [],
  avoidedMovies: [],
  watchLaterMovies: [],
  likedTags: [],
  confirmedTags: [],
  avoidedTags: [],
  currentMood: undefined,
  name: '',
  bio: '',
  favoriteGenres: [],
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    // Try to load from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      // Ensure all arrays are initialized even if they're missing in saved data
      const parsedProfile = JSON.parse(savedProfile);
      return {
        ...initialProfile, // Start with all defaults
        ...parsedProfile,  // Override with saved values
        // Ensure these critical arrays exist and are arrays
        likedMovies: Array.isArray(parsedProfile.likedMovies) ? parsedProfile.likedMovies : [],
        dislikedMovies: Array.isArray(parsedProfile.dislikedMovies) ? parsedProfile.dislikedMovies : [],
        avoidedMovies: Array.isArray(parsedProfile.avoidedMovies) ? parsedProfile.avoidedMovies : [],
        watchLaterMovies: Array.isArray(parsedProfile.watchLaterMovies) ? parsedProfile.watchLaterMovies : [],
        likedTags: Array.isArray(parsedProfile.likedTags) ? parsedProfile.likedTags : [],
        confirmedTags: Array.isArray(parsedProfile.confirmedTags) ? parsedProfile.confirmedTags : [],
        avoidedTags: Array.isArray(parsedProfile.avoidedTags) ? parsedProfile.avoidedTags : [],
      };
    }
    return initialProfile;
  });

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  // Function to handle updating tags when movies are added/removed
  const updateTagsFromMovies = async () => {
    try {
      // Fix here: Make sure we're passing parameters according to the function signature
      // The error indicates extractTagsFromMovies expects only 1 argument, so we need to pass
      // an object that contains both likedMovies and dislikedMovies
      const { likedTags: newLikedTags, confirmedTags: newConfirmedTags } = 
        await extractTagsFromMovies({
          likedMovies: profile.likedMovies,
          dislikedMovies: profile.dislikedMovies
        });
      
      // Update tags with net scores (liked - disliked*2)
      const processedLikedTags = newLikedTags.map(tag => {
        const netScore = calculateTagNetScore(tag.occurrences, tag.dislikedOccurrences);
        return { ...tag, netScore };
      });
      
      const processedConfirmedTags = newConfirmedTags.map(tag => {
        const netScore = calculateTagNetScore(tag.occurrences, tag.dislikedOccurrences);
        return { ...tag, netScore };
      });
      
      // Preserve user overrides
      const updatedConfirmedTags = processedConfirmedTags.map(tag => ({
        ...tag,
        override: profile.confirmedTags.some(t => t.id === tag.id && t.override) || false
      }));
      
      setProfile(current => ({
        ...current,
        likedTags: processedLikedTags,
        confirmedTags: updatedConfirmedTags
      }));
    } catch (error) {
      console.error("Error updating tags from movies:", error);
    }
  };

  const addLikedMovie = (movie: Movie) => {
    setProfile(prev => {
      // Remove from disliked and avoided if it was there
      const filteredDisliked = prev.dislikedMovies.filter(m => m.id !== movie.id);
      const filteredAvoided = prev.avoidedMovies.filter(m => m.id !== movie.id);
      const filteredWatchLater = prev.watchLaterMovies.filter(m => m.id !== movie.id);
      
      // Check if already in liked movies
      const isAlreadyLiked = prev.likedMovies.some(m => m.id === movie.id);
      
      if (isAlreadyLiked) return prev;
      
      // Schedule tag extraction with the updated movie collection
      setTimeout(() => updateTagsFromMovies(), 0);
      
      return {
        ...prev,
        likedMovies: [...prev.likedMovies, movie],
        dislikedMovies: filteredDisliked,
        avoidedMovies: filteredAvoided,
        watchLaterMovies: filteredWatchLater
      };
    });
  };

  const removeLikedMovie = (movieId: number) => {
    setProfile(prev => {
      const updatedLikedMovies = prev.likedMovies.filter(m => m.id !== movieId);
      
      // Schedule tag extraction with the updated movie collection
      setTimeout(() => updateTagsFromMovies(), 0);
      
      return {
        ...prev,
        likedMovies: updatedLikedMovies
      };
    });
  };

  const addDislikedMovie = (movie: Movie) => {
    setProfile(prev => {
      // Remove from liked and avoided if it was there
      const filteredLiked = prev.likedMovies.filter(m => m.id !== movie.id);
      const filteredAvoided = prev.avoidedMovies.filter(m => m.id !== movie.id);
      const filteredWatchLater = prev.watchLaterMovies.filter(m => m.id !== movie.id);
      
      // Check if already in disliked movies
      const isAlreadyDisliked = prev.dislikedMovies.some(m => m.id === movie.id);
      
      if (isAlreadyDisliked) return prev;
      
      // Schedule tag extraction with the updated movie collection
      setTimeout(() => updateTagsFromMovies(), 0);
      
      return {
        ...prev,
        dislikedMovies: [...prev.dislikedMovies, movie],
        likedMovies: filteredLiked,
        avoidedMovies: filteredAvoided,
        watchLaterMovies: filteredWatchLater
      };
    });
  };

  const removeDislikedMovie = (movieId: number) => {
    setProfile(prev => {
      const updatedDislikedMovies = prev.dislikedMovies.filter(m => m.id !== movieId);
      
      // Schedule tag extraction with the updated movie collection
      setTimeout(() => updateTagsFromMovies(), 0);
      
      return {
        ...prev,
        dislikedMovies: updatedDislikedMovies
      };
    });
  };

  const addAvoidedMovie = (movie: Movie) => {
    setProfile(prev => {
      // Remove from liked and disliked if it was there
      const filteredLiked = prev.likedMovies.filter(m => m.id !== movie.id);
      const filteredDisliked = prev.dislikedMovies.filter(m => m.id !== movie.id);
      const filteredWatchLater = prev.watchLaterMovies.filter(m => m.id !== movie.id);
      
      // Check if already in avoided movies
      const isAlreadyAvoided = prev.avoidedMovies.some(m => m.id === movie.id);
      
      if (isAlreadyAvoided) return prev;
      
      return {
        ...prev,
        avoidedMovies: [...prev.avoidedMovies, movie],
        likedMovies: filteredLiked,
        dislikedMovies: filteredDisliked,
        watchLaterMovies: filteredWatchLater
      };
    });
  };

  const removeAvoidedMovie = (movieId: number) => {
    setProfile(prev => ({
      ...prev,
      avoidedMovies: prev.avoidedMovies.filter(m => m.id !== movieId)
    }));
  };

  const addWatchLaterMovie = (movie: Movie) => {
    setProfile(prev => {
      const isAlreadyWatchLater = prev.watchLaterMovies.some(m => m.id === movie.id);
      if (isAlreadyWatchLater) return prev;
      
      return {
        ...prev,
        watchLaterMovies: [...prev.watchLaterMovies, movie]
      };
    });
  };

  const removeWatchLaterMovie = (movieId: number) => {
    setProfile(prev => ({
      ...prev,
      watchLaterMovies: prev.watchLaterMovies.filter(m => m.id !== movieId)
    }));
  };

  // Function to calculate if a tag should be confirmed based on threshold and net score
  const shouldBeConfirmed = (tag: Tag, totalLikedTags: number): boolean => {
    // Calculate the net score if not already done
    const netScore = tag.netScore ?? calculateTagNetScore(tag.occurrences, tag.dislikedOccurrences);
    
    // If net score is negative, don't confirm the tag
    if (netScore <= 0) return false;
    
    // Apply threshold logic based on total liked tags
    if (totalLikedTags <= 50) {
      return netScore >= 2;
    } else {
      // Calculate 5% threshold (rounded up)
      const threshold = Math.ceil(totalLikedTags * 0.05);
      return netScore >= threshold;
    }
  };
  
  // Function to update confirmed tags based on current liked tags
  const updateConfirmedTags = () => {
    setProfile(prev => {
      const totalLikedTags = prev.likedTags.length;
      
      // Create a map of all tags that should be confirmed
      const confirmedMap = new Map<string, Tag>();
      
      // First add all manually overridden tags
      prev.confirmedTags
        .filter(tag => tag.override)
        .forEach(tag => confirmedMap.set(tag.id, tag));
      
      // Then, process liked tags to see if they should be promoted
      prev.likedTags.forEach(tag => {
        if (shouldBeConfirmed(tag, totalLikedTags) || tag.override) {
          confirmedMap.set(tag.id, {...tag, confirmed: true});
        }
      });
      
      return {
        ...prev,
        confirmedTags: Array.from(confirmedMap.values())
      };
    });
  };

  const addLikedTag = (tag: Tag) => {
    setProfile(prev => {
      // Check if tag already exists in liked tags
      const tagExists = prev.likedTags.some(t => t.id === tag.id);
      
      // If tag exists, update its occurrences
      if (tagExists) {
        const updatedLikedTags = prev.likedTags.map(t => {
          if (t.id === tag.id) {
            const occurrences = (t.occurrences || 0) + 1;
            const movieIds = [...(t.movieIds || []), ...(tag.movieIds || [])];
            // Remove duplicates from movieIds
            const uniqueMovieIds = [...new Set(movieIds)];
            return {...t, occurrences, movieIds: uniqueMovieIds};
          }
          return t;
        });
        
        return {
          ...prev,
          likedTags: updatedLikedTags
        };
      }
      
      // Otherwise, add the new tag with occurrences=1
      const newTag = {
        ...tag, 
        occurrences: 1,
        movieIds: tag.movieIds || []
      };
      
      return {
        ...prev,
        likedTags: [...prev.likedTags, newTag]
      };
    });
    
    // Update confirmed tags after adding a liked tag
    updateConfirmedTags();
  };
  
  const removeLikedTag = (tagId: string) => {
    setProfile(prev => ({
      ...prev,
      likedTags: prev.likedTags.filter(t => t.id !== tagId)
    }));
    
    // Update confirmed tags after removing a liked tag
    updateConfirmedTags();
  };
  
  const addConfirmedTag = (tag: Tag) => {
    setProfile(prev => {
      // Check if tag already exists in confirmed tags
      const tagExists = prev.confirmedTags.some(t => t.id === tag.id);
      if (tagExists) return prev;
      
      return {
        ...prev,
        confirmedTags: [...prev.confirmedTags, {...tag, confirmed: true, override: true}]
      };
    });
  };
  
  const removeConfirmedTag = (tagId: string) => {
    setProfile(prev => ({
      ...prev,
      confirmedTags: prev.confirmedTags.filter(t => t.id !== tagId)
    }));
  };
  
  const addAvoidedTag = (tag: Tag) => {
    setProfile(prev => {
      // Check if tag already exists in avoided tags
      const tagExists = prev.avoidedTags.some(t => t.id === tag.id);
      if (tagExists) return prev;
      
      return {
        ...prev,
        avoidedTags: [...prev.avoidedTags, tag]
      };
    });
  };
  
  const removeAvoidedTag = (tagId: string) => {
    setProfile(prev => ({
      ...prev,
      avoidedTags: prev.avoidedTags.filter(t => t.id !== tagId)
    }));
  };
  
  // Tag promotion and demotion functions
  const promoteTagToConfirmed = (tagId: string) => {
    setProfile(prev => {
      // Check if the tag exists in liked tags
      const likedTag = prev.likedTags.find(t => t.id === tagId);
      
      if (likedTag) {
        // Remove from liked tags
        const updatedLikedTags = prev.likedTags.filter(t => t.id !== tagId);
        
        // Add to confirmed tags with override flag and special name indicator
        const confirmedTag = {
          ...likedTag,
          confirmed: true,
          override: true,
          // Prepend a star to the name if it doesn't already have one
          name: likedTag.name.startsWith('⭐') ? likedTag.name : `⭐ ${likedTag.name}`
        };
        
        // Check if it's already in confirmed tags
        const alreadyInConfirmed = prev.confirmedTags.some(t => t.id === tagId);
        
        return {
          ...prev,
          likedTags: updatedLikedTags,
          confirmedTags: alreadyInConfirmed 
            ? prev.confirmedTags.map(t => t.id === tagId ? confirmedTag : t) 
            : [...prev.confirmedTags, confirmedTag]
        };
      }
      
      return prev;
    });
  };
  
  const demoteTagFromConfirmed = (tagId: string) => {
    setProfile(prev => {
      // Check if the tag exists in confirmed tags
      const confirmedTag = prev.confirmedTags.find(t => t.id === tagId);
      
      if (confirmedTag) {
        // If this was a system-calculated confirmed tag, just remove the override
        if (!confirmedTag.override && confirmedTag.occurrences) {
          return {
            ...prev,
            confirmedTags: prev.confirmedTags.map(t => 
              t.id === tagId ? { ...t, override: false } : t
            )
          };
        } else {
          // Otherwise, remove from confirmed and add to liked tags if not already there
          const updatedConfirmedTags = prev.confirmedTags.filter(t => t.id !== tagId);
          
          // Check if it's already in liked tags
          const alreadyInLiked = prev.likedTags.some(t => t.id === tagId);
          
          if (!alreadyInLiked) {
            // Only add to liked tags if it's not already there
            const likedTag = {
              ...confirmedTag,
              confirmed: false,
              override: false,
              // Remove the star from the name if it has one
              name: confirmedTag.name.startsWith('⭐') 
                ? confirmedTag.name.substring(2).trim() 
                : confirmedTag.name
            };
            
            return {
              ...prev,
              confirmedTags: updatedConfirmedTags,
              likedTags: [...prev.likedTags, likedTag]
            };
          }
          
          return {
            ...prev,
            confirmedTags: updatedConfirmedTags
          };
        }
      }
      
      return prev;
    });
  };
  
  // Legacy functions for backward compatibility
  const addTag = (tag: Tag) => {
    if (tag.confirmed) {
      addConfirmedTag(tag);
    } else {
      addLikedTag(tag);
    }
  };

  const removeTag = (tagId: string) => {
    removeLikedTag(tagId);
    removeConfirmedTag(tagId);
    removeAvoidedTag(tagId);
  };

  const setCurrentMood = (mood: Mood) => {
    setProfile(prev => ({
      ...prev,
      currentMood: mood
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }));
  };

  const clearProfile = () => {
    setProfile(initialProfile);
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      addLikedMovie,
      removeLikedMovie,
      addDislikedMovie,
      removeDislikedMovie,
      addAvoidedMovie,
      removeAvoidedMovie,
      addWatchLaterMovie,
      removeWatchLaterMovie,
      addLikedTag,
      removeLikedTag,
      addConfirmedTag,
      removeConfirmedTag,
      addAvoidedTag,
      removeAvoidedTag,
      updateConfirmedTags,
      promoteTagToConfirmed,
      demoteTagFromConfirmed,
      addTag,
      removeTag,
      setCurrentMood,
      updateProfile,
      clearProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }

  // Add a compatibility layer for the old tags property
  const compatibleProfile = {
    ...context.profile,
    // For backward compatibility, combine confirmed tags as the primary tags
    tags: [
      ...(Array.isArray(context.profile.confirmedTags) ? context.profile.confirmedTags : []),
      ...(Array.isArray(context.profile.likedTags) 
        ? context.profile.likedTags.filter(lt => 
            !Array.isArray(context.profile.confirmedTags) || 
            !context.profile.confirmedTags.some(ct => ct.id === lt.id)
          )
        : [])
    ]
  };

  return {
    ...context,
    profile: compatibleProfile
  };
};
