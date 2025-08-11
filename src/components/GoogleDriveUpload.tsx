
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { useGoogleDriveUpload } from '@/hooks/useGoogleDriveUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GoogleDriveUploadProps {
  onUploadSuccess: (downloadLink: string, fileName: string) => void;
}

export const GoogleDriveUpload: React.FC<GoogleDriveUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadToGoogleDrive, isUploading } = useGoogleDriveUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadError(null);
    console.log('Starting upload for file:', fileName);
    
    const result = await uploadToGoogleDrive(selectedFile, fileName);
    
    if (result.success && result.downloadLink) {
      onUploadSuccess(result.downloadLink, result.fileName || fileName);
      // Reset form
      setSelectedFile(null);
      setFileName('');
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } else {
      setUploadError(result.error || 'Erro desconhecido no upload');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium">Upload para Google Drive</h3>
      
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {uploadError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="file-upload">Selecionar Arquivo</Label>
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept="*/*"
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

          <div className="text-sm text-gray-600">
            <p>Arquivo selecionado: {selectedFile.name}</p>
            <p>Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          <Button 
            onClick={handleUpload}
            disabled={isUploading || !fileName.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando para Google Drive...
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
