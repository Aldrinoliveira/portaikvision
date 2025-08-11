
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Users, BarChart3, Settings } from 'lucide-react';

const Admin = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo primeiro.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Primeiro, obter a URL pré-assinada
      const { data: presignData, error: presignError } = await supabase.functions.invoke('contabo-presign-upload', {
        body: {
          fileName: selectedFile.name,
          fileType: selectedFile.type
        }
      });

      if (presignError) {
        throw new Error(`Erro ao obter URL de upload: ${presignError.message}`);
      }

      // Fazer upload do arquivo usando a URL pré-assinada
      const uploadResponse = await fetch(presignData.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro no upload: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      // Gerar o link de download (URL pública do arquivo)
      const downloadUrl = `https://storage.contabostorage.eu/hikvision-files/${presignData.fileName}`;

      toast({
        title: "Upload concluído!",
        description: `Arquivo enviado com sucesso. Link: ${downloadUrl}`,
      });

      // Limpar seleção de arquivo
      setSelectedFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      console.log('Link de download gerado:', downloadUrl);

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Painel Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Produtos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Gerenciar produtos e catálogos</p>
              <Button className="w-full">Acessar Produtos</Button>
            </CardContent>
          </Card>

          {/* Usuários */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Gerenciar usuários do sistema</p>
              <Button className="w-full">Acessar Usuários</Button>
            </CardContent>
          </Card>

          {/* Relatórios */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Visualizar relatórios e estatísticas</p>
              <Button className="w-full">Acessar Relatórios</Button>
            </CardContent>
          </Card>

          {/* Cadastro de Arquivos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cadastro de Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Upload de arquivos para o Contabo Object Storage</p>
              
              <div className="space-y-2">
                <Label htmlFor="file-upload">Selecionar Arquivo</Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>

              {selectedFile && (
                <div className="p-2 bg-muted rounded-md">
                  <p className="text-sm">
                    <strong>Arquivo selecionado:</strong> {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
