
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { useGoogleDriveUpload } from '@/hooks/useGoogleDriveUpload';

interface GoogleDriveUploadProps {
  onUploadSuccess: (downloadLink: string, fileName: string) => void;
}

export const GoogleDriveUpload: React.FC<GoogleDriveUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const { uploadToGoogleDrive, isUploading } = useGoogleDriveUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadToGoogleDrive(selectedFile, fileName);
    
    if (result.success && result.downloadLink) {
      onUploadSuccess(result.downloadLink, result.fileName || fileName);
      // Reset form
      setSelectedFile(null);
      setFileName('');
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium">Upload para Google Drive</h3>
      
      <div className="space-y-2">
        <Label htmlFor="file-upload">Selecionar Arquivo</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {selectedFile && (
        <>
          <div className="space-y-2">
            <Label htmlFor="file-name">Nome do Arquivo</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nome do arquivo"
              disabled={isUploading}
            />
          </div>

          <Button 
            onClick={handleUpload}
            disabled={isUploading || !fileName.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar para Google Drive
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};
