
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadButtonProps {
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ 
  onUploadSuccess, 
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create a unique filename while preserving the original extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('arquivos')
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('arquivos')
        .getPublicUrl(data.path);

      onUploadSuccess(publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || uploading}
        onClick={() => document.getElementById('file-upload')?.click()}
        className="ml-2"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Enviando...' : 'Upload'}
      </Button>
    </div>
  );
};
