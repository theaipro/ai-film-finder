
import React, { useState } from 'react';
import { Tag } from '@/types';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  tags: Tag[];
  onAddTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ tags, onAddTag, onRemoveTag }) => {
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = () => {
    if (newTagName.trim()) {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        name: newTagName.trim(),
        source: 'manual',
        type: 'custom'
      };
      onAddTag(newTag);
      setNewTagName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const getTagColor = (tag: Tag) => {
    switch (tag.type) {
      case 'genre':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'theme':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'tone':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'custom':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags yet. Add some to improve recommendations.</p>
        ) : (
          tags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="outline"
              className={cn("flex items-center gap-1 px-3 py-1", getTagColor(tag))}
            >
              {tag.name}
              <button 
                onClick={() => onRemoveTag(tag.id)}
                className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
      
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
};

export default TagSelector;
