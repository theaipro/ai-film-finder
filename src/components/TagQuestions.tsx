
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Tag } from '@/types';

interface TagQuestionProps {
  suggestedTags: Tag[];
  existingTags: Tag[];
  onSaveTags: (selectedTags: Tag[]) => void;
}

const TagQuestions: React.FC<TagQuestionProps> = ({ 
  suggestedTags, 
  existingTags,
  onSaveTags 
}) => {
  const form = useForm({
    defaultValues: {
      tags: existingTags.map(tag => tag.id)
    }
  });

  const handleSubmit = (data: { tags: string[] }) => {
    const selectedTags = suggestedTags.filter(tag => data.tags.includes(tag.id));
    onSaveTags(selectedTags);
  };

  // Group tags by type for better organization
  const groupedTags = suggestedTags.reduce((acc, tag) => {
    if (!acc[tag.type]) {
      acc[tag.type] = [];
    }
    acc[tag.type].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  // Get the tag type labels for display
  const tagTypeLabels = {
    'genre': 'Genres',
    'theme': 'Themes',
    'tone': 'Tones',
    'custom': 'Custom Tags'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Personalize Your Tags</h2>
        <p className="text-muted-foreground">
          Select the tags that best represent your movie taste preferences. These will help us find recommendations you'll love.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {Object.entries(groupedTags).map(([type, tags]) => (
            <div key={type} className="space-y-3">
              <h3 className="text-lg font-medium">{tagTypeLabels[type as keyof typeof tagTypeLabels] || type}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tags.map(tag => (
                  <FormField
                    key={tag.id}
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(tag.id)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              if (checked) {
                                if (!value.includes(tag.id)) {
                                  field.onChange([...value, tag.id]);
                                }
                              } else {
                                field.onChange(value.filter(v => v !== tag.id));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{tag.name}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Button type="submit" className="w-full">Save My Preferences</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TagQuestions;
