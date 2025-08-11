
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface FileUploadButtonProps {
  onUploadSuccess: (url: string) => void;
}

export const FileUploadButton = ({ onUploadSuccess }: FileUploadButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    console.log('Starting file upload for:', file.name);

    try {
      // Get presigned URL from Contabo
      const { data: presignData, error: presignError } = await supabase.functions.invoke('contabo-presign-upload', {
        body: { fileName: file.name }
      });

      if (presignError) {
        console.error('Error getting presigned URL:', presignError);
        throw new Error('Erro ao obter URL de upload');
      }

      console.log('Got presigned URL:', presignData);

      // Upload file to Contabo using presigned URL
      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResponse.ok) {
        console.error('Upload failed:', uploadResponse.status, uploadResponse.statusText);
        throw new Error('Erro no upload do arquivo');
      }

      console.log('File uploaded successfully to:', presignData.publicUrl);
      
      // Update the form with the download URL
      onUploadSuccess(presignData.publicUrl);
      
      toast({
        title: "Upload realizado com sucesso!",
        description: `Arquivo ${file.name} enviado com sucesso.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido no upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => document.getElementById('file-upload')?.click()}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading ? 'Enviando...' : 'Upload'}
      </Button>
    </div>
  );
};
