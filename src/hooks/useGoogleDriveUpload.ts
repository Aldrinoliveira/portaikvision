
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      const formData = new FormData();
      formData.append('file', file);
      if (fileName) {
        formData.append('fileName', fileName);
      }

      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Falha no upload');
      }

      toast.success('Arquivo enviado para Google Drive com sucesso!');
      return data;

    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToGoogleDrive,
    isUploading
  };
};
