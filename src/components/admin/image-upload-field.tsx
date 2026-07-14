import React from 'react';
import { toast } from 'sonner';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processImage } from '@/lib/api/image';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  testId?: string;
}

export function ImageUploadField({ value, onChange, testId }: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await processImage(file);
      onChange(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image processing failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        data-testid={testId}
      />
      {value ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border bg-muted">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center text-foreground hover:bg-background"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <ImagePlus className="w-4 h-4 mr-2" /> {value ? 'Change Image' : 'Upload Image'}
          </>
        )}
      </Button>
    </div>
  );
}
