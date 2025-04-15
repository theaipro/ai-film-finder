
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AIChatConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  defaultApiKey?: string;
}

const AIChatConfig: React.FC<AIChatConfigProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  defaultApiKey = ''
}) => {
  const [apiKey, setApiKey] = useState(defaultApiKey);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('gemini_api_key', apiKey);
    
    // Notify parent component
    onSave(apiKey);
    
    toast.success('API key saved successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Chat Configuration</DialogTitle>
          <DialogDescription>
            Enter your Gemini AI API key to use the chat feature.
            You can get a key from the Google AI Studio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Gemini API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSyC..."
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and is never sent to our servers.
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>To get an API key:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a></li>
              <li>Create an account or sign in</li>
              <li>Go to "API keys" section</li>
              <li>Create a new API key</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatConfig;
