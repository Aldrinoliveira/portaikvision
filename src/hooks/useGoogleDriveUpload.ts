
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  downloadLink?: string;
  viewLink?: string;
  error?: string;
}

export const useGoogleDriveUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadToGoogleDrive = async (file: File, fileName?: string): Promise<UploadResult> => {
    setIsUploading(true);
    
    try {
      console.log('Starting upload process for file:', fileName || file.name);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (fileName) {
        formData.append('fileName', fileName);
      }

      console.log('Calling Google Drive upload function...');
      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: formData,
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro na função de upload');
      }

      if (!data) {
        throw new Error('Nenhuma resposta da função de upload');
      }

      if (!data.success) {
        console.error('Upload failed:', data.error);
        throw new Error(data.error || 'Falha no upload');
      }

      console.log('Upload successful:', data);
      toast.success('Arquivo enviado para Google Drive com sucesso!');
      return data;

    } catch (error) {
      console.error('Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro no upload: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToGoogleDrive,
    isUploading
  };
};
