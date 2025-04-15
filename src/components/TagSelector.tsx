
import React, { useState, useEffect } from 'react';
import { Tag } from '@/types';
import { X, Plus, Star, ChevronUp, ChevronDown, CirclePercent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfile } from '@/context/ProfileContext';
import { categorizeTagsByType } from '@/services/movieService';

interface TagSelectorProps {
  tags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ 
  tags, 
  onAddTag, 
  onRemoveTag 
}) => {
  const { promoteTagToConfirmed, demoteTagFromConfirmed } = useProfile();
  const [newTagName, setNewTagName] = useState('');
  const [categorizedTags, setCategorizedTags] = useState<Record<string, Tag[][]>>({});

  // Categorize tags when they change
  useEffect(() => {
    // Ensure tags is an array before calling categorizeTagsByType
    if (Array.isArray(tags)) {
      setCategorizedTags(categorizeTagsByType(tags));
    } else {
      setCategorizedTags({});
    }
  }, [tags]);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        source: 'manual',
        type: 'custom',
        occurrences: 1,
        confirmed: true,
        override: true
      };
      onAddTag(newTag);
      setNewTagName('');
    }
  };
  
  const handlePromoteTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    promoteTagToConfirmed(tagId);
  };
  
  const handleDemoteTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    demoteTagFromConfirmed(tagId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const getTagColor = (tag: Tag) => {
    // Priority 1: Check if this is a confirmed tag (stronger color)
    if (tag.confirmed) {
      switch (tag.type) {
        case 'genre':
          return 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-200 font-semibold';
        case 'theme':
          return 'bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-200 font-semibold';
        case 'tone':
          return 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-200 font-semibold';
        case 'keyword':
          return 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-200 font-semibold';
        case 'custom':
          return 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-200 font-semibold';
        default:
          return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-200 font-semibold';
      }
    }
    
    // Priority 2: Regular tag colors
    switch (tag.type) {
      case 'genre':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'theme':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'tone':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'keyword':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'custom':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Get weight indicator
  const getTagWeight = (tag: Tag) => {
    // Confirmed tags have double weight
    if (tag.confirmed) {
      return 2 * (tag.occurrences || 1);
    }
    // Liked tags have normal weight
    return tag.occurrences || 1;
  };

  const tagTypeLabels = {
    'genre': 'Genres',
    'theme': 'Themes',
    'tone': 'Tones',
    'custom': 'Custom Tags',
    'keyword': 'Keywords',
    'actor': 'Actors',
    'director': 'Directors'
  };

  if (tags.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No tags yet. Add some to improve recommendations.</p>
        <div className="flex gap-2">
          <Input
            placeholder="Add a new tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow"
          />
          <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(categorizedTags).map(([type, tagGroups]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-medium">
            {tagTypeLabels[type as keyof typeof tagTypeLabels] || type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
          
          {tagGroups.map((group, groupIndex) => (
            <div key={`${type}-group-${groupIndex}`} className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {group.map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant="outline"
                    className={cn("flex items-center gap-1 px-3 py-1", getTagColor(tag))}
                    title={tag.confirmed ? 
                      `Confirmed tag (double weight, appears in ${tag.occurrences || 0} movies)${tag.override ? ' (manually confirmed)' : ''}` : 
                      `Regular tag (normal weight, appears in ${tag.occurrences || 0} movies)`}
                  >
                    {tag.confirmed && !tag.name.startsWith('⭐') && 
                      <Star className="h-3 w-3 fill-yellow-500 mr-1" />}
                    {tag.name}
                    
                    {/* Weight indicator */}
                    <span className="flex items-center ml-1 text-xs opacity-80">
                      <CirclePercent className="h-3 w-3 mr-0.5" />
                      {getTagWeight(tag)}x
                    </span>
                    
                    {/* Tag controls */}
                    <span className="flex gap-1 ml-1">
                      {/* Promote button - only show for non-confirmed tags */}
                      {!tag.confirmed && (
                        <button 
                          onClick={(e) => handlePromoteTag(tag.id, e)}
                          className="hover:bg-green-200 dark:hover:bg-green-900 rounded-full"
                          title="Promote to confirmed tag (double weight)"
                        >
                          <ChevronUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </button>
                      )}
                      
                      {/* Demote button - only show for confirmed tags with override */}
                      {tag.confirmed && tag.override && (
                        <button 
                          onClick={(e) => handleDemoteTag(tag.id, e)}
                          className="hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded-full"
                          title="Demote to regular tag (normal weight)"
                        >
                          <ChevronDown className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                        </button>
                      )}
                      
                      {/* Remove button */}
                      <button 
                        onClick={() => onRemoveTag(tag.id)}
                        className="hover:bg-red-200 dark:hover:bg-red-900 rounded-full"
                        title="Remove tag"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="flex gap-2 pt-4">
        <Input
          placeholder="Add a new tag..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-grow"
        />
        <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default TagSelector;
