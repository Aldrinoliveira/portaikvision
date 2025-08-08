import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Admin = () => {
  const navigate = useNavigate();

  // Types
  type DriveFile = { id: string; name: string; publicUrl: string; mimeType: string };

  // State
  const [productId, setProductId] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Admin – Gerenciar Arquivos';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Painel Admin para gerenciar arquivos do Google Drive.');
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      const isAdmin = (roles || []).some((r: any) => r.role === 'admin');
      if (!isAdmin) navigate('/');
    };
    init();
  }, [navigate]);

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve((res.split(',')[1] || ''));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const listFiles = async () => {
    if (!productId) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('gdrive-list', {
      body: { productId, pageSize: 100 },
    });
    if (!error) setFiles((data as any)?.files || []);
    setLoading(false);
  };

  const upload = async () => {
    if (!productId || !selectedFile) return;
    setLoading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const { error } = await supabase.functions.invoke('gdrive', {
        body: {
          action: 'upload',
          productId,
          fileName: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
          fileBase64: base64,
        },
      });
      if (!error) {
        setSelectedFile(null);
        await listFiles();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Painel Admin</h1>
      <p className="text-muted-foreground">Em breve: gerenciamento de Banners, Categorias, Produtos, Arquivos e Solicitações.</p>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Arquivos do Google Drive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <Input placeholder="Produto ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <div className="flex gap-2">
                <Button onClick={listFiles} disabled={!productId || loading}>Listar</Button>
                <Button onClick={upload} disabled={!productId || !selectedFile || loading}>Upload</Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((f) => (
                <Card key={f.id} className="hover:shadow-md transition">
                  <CardHeader>
                    <CardTitle className="text-base">{f.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <Button asChild>
                      <a href={f.publicUrl} target="_blank" rel="noopener noreferrer">Abrir</a>
                    </Button>
                    <span className="text-xs text-muted-foreground">{f.mimeType}</span>
                  </CardContent>
                </Card>
              ))}
              {files.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum arquivo listado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};


export default Admin;
