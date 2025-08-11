import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ContaboTest = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileKey, setUploadedFileKey] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name, file.type, file.size);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting upload process...');
      
      // Get presigned URL from our edge function
      const { data: presignData, error: presignError } = await supabase.functions.invoke('contabo-presign-upload', {
        body: {
          fileName: selectedFile.name,
          contentType: selectedFile.type
        }
      });

      if (presignError) {
        throw new Error(presignError.message);
      }

      console.log('Presigned data received:', presignData);

      // Upload the file using PUT method with presigned URL
      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: presignData.method || 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('Upload successful!');
      setUploadedFileKey(presignData.fileKey);
      
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!"
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateDownloadUrl = async () => {
    if (!uploadedFileKey) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo foi enviado ainda",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingDownload(true);
    try {
      console.log('Generating download URL for:', uploadedFileKey);

      const { data: downloadData, error: downloadError } = await supabase.functions.invoke('contabo-presign-download', {
        body: {
          fileKey: uploadedFileKey
        }
      });

      if (downloadError) {
        throw new Error(downloadError.message);
      }

      console.log('Download URL generated:', downloadData.downloadUrl);
      setDownloadUrl(downloadData.downloadUrl);
      
      toast({
        title: "Sucesso",
        description: "Link de download gerado!"
      });

    } catch (error) {
      console.error('Download URL generation error:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Teste Contabo Object Storage</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload de Arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </div>
            
            {selectedFile && (
              <div className="text-sm text-gray-600">
                <p><strong>Arquivo:</strong> {selectedFile.name}</p>
                <p><strong>Tipo:</strong> {selectedFile.type}</p>
                <p><strong>Tamanho:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
            
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="w-full"
            >
              {isUploading ? "Enviando..." : "Fazer Upload"}
            </Button>

            {uploadedFileKey && (
              <div className="text-sm text-green-600">
                <p><strong>Arquivo enviado:</strong> {uploadedFileKey}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle>Download de Arquivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerateDownloadUrl}
              disabled={!uploadedFileKey || isGeneratingDownload}
              className="w-full"
            >
              {isGeneratingDownload ? "Gerando..." : "Gerar Link de Download"}
            </Button>

            {downloadUrl && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Link de Download:</p>
                <div className="p-2 bg-gray-100 rounded text-sm break-all">
                  {downloadUrl}
                </div>
                <Button 
                  onClick={() => window.open(downloadUrl, '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  Abrir Arquivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Estado do Upload:</strong> {isUploading ? "Em andamento" : "Parado"}</p>
            <p><strong>Arquivo Selecionado:</strong> {selectedFile ? selectedFile.name : "Nenhum"}</p>
            <p><strong>Chave do Arquivo:</strong> {uploadedFileKey || "Nenhum arquivo enviado"}</p>
            <p><strong>URL de Download:</strong> {downloadUrl ? "Gerada" : "Não gerada"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContaboTest;
