
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type UploadResponse = {
  name: string;
  path: string;
  size: number;
  preview_url: string;
  download_url: string;
};

export default function DropboxUpload() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [folderPath, setFolderPath] = useState<string>("");
  const [linkType, setLinkType] = useState<"preview" | "download">("preview");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[1] ? e.target.files?.[0] : e.target.files?.[0] || null;
    setFile(f || null);
    setResult(null);
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async () => {
    if (!file) {
      toast({ title: "Selecione um arquivo", description: "Escolha um arquivo para enviar ao Dropbox." });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Limite de 15MB para upload." });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const base64 = await toBase64(file);
      console.log("[DropboxUpload] Calling edge function upload-to-dropbox", { name: file.name, size: file.size });

      const { data, error } = await supabase.functions.invoke("upload-to-dropbox", {
        body: {
          filename: file.name,
          mimeType: file.type,
          base64,
          folderPath: folderPath || undefined,
        },
      });

      if (error) {
        console.error("[DropboxUpload] Edge function error", error);
        toast({ title: "Falha no upload", description: String(error.message || error), });
        return;
      }

      console.log("[DropboxUpload] Edge function result", data);
      setResult(data as UploadResponse);

      const chosenUrl = (data as UploadResponse)[linkType === "preview" ? "preview_url" : "download_url"];
      await navigator.clipboard.writeText(chosenUrl);
      toast({
        title: "Upload concluído",
        description: `Link (${linkType === "preview" ? "visualização" : "download"}) copiado para a área de transferência.`,
      });
    } catch (e: any) {
      console.error("[DropboxUpload] Unexpected error", e);
      toast({ title: "Erro inesperado", description: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card className="border">
        <CardHeader>
          <CardTitle>Upload para Dropbox</CardTitle>
          <CardDescription>Envie um arquivo para o seu Dropbox e obtenha o link de visualização ou download.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <Input type="file" onChange={onFileChange} />
            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Pasta (opcional)</Label>
            <Input
              placeholder="/HikSupport"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Se vazio, será usada a pasta padrão configurada no servidor.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Link</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={linkType === "preview" ? "default" : "outline"}
                onClick={() => setLinkType("preview")}
              >
                Visualização
              </Button>
              <Button
                type="button"
                variant={linkType === "download" ? "default" : "outline"}
                onClick={() => setLinkType("download")}
              >
                Download direto
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={handleUpload} disabled={loading || !file}>
              {loading ? "Enviando..." : "Enviar para Dropbox"}
            </Button>
          </div>

          {result && (
            <div className="space-y-2">
              <p className="text-sm">Caminho: <span className="font-mono">{result.path}</span></p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(result.preview_url)}
                >
                  Copiar link de visualização
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(result.download_url)}
                >
                  Copiar link de download
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground break-all">Preview: {result.preview_url}</p>
                <p className="text-xs text-muted-foreground break-all">Download: {result.download_url}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
