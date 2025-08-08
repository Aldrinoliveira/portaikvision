import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
const Admin = () => {
  const navigate = useNavigate();

  // Types
  type DriveFile = { id: string; name: string; publicUrl: string; mimeType: string };
  type Banner = { id: string; imagem_url: string; tamanho: string | null; link_redirecionamento: string | null; ativo: boolean };

  // State
  const [productId, setProductId] = useState("");
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Banners
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bImagemUrl, setBImagemUrl] = useState("");
  const [bLink, setBLink] = useState("");
  const [bTamanho, setBTamanho] = useState("");
  const [bAtivo, setBAtivo] = useState(true);
  const [bLoading, setBLoading] = useState(false);

  useEffect(() => {
    document.title = 'Admin – Banners e Arquivos';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Painel Admin para gerenciar banners e arquivos (Google Drive).');
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
      if (!isAdmin) {
        navigate('/');
        return;
      }
      await loadBanners();
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

  // Banners CRUD
  const loadBanners = async () => {
    const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro ao carregar banners', description: error.message });
      return;
    }
    setBanners((data || []) as any);
  };

  const createBanner = async () => {
    if (!bImagemUrl.trim()) {
      toast({ title: 'Imagem é obrigatória', description: 'Informe a URL da imagem do banner.' });
      return;
    }
    setBLoading(true);
    const payload = {
      imagem_url: bImagemUrl.trim(),
      link_redirecionamento: bLink.trim() || null,
      tamanho: bTamanho.trim() || null,
      ativo: bAtivo,
    };
    const { error } = await supabase.from('banners').insert(payload as any);
    if (error) {
      toast({ title: 'Erro ao criar', description: error.message });
    } else {
      toast({ title: 'Banner criado' });
      setBImagemUrl(''); setBLink(''); setBTamanho(''); setBAtivo(true);
      await loadBanners();
    }
    setBLoading(false);
  };

  const toggleAtivo = async (banner: Banner) => {
    const { error } = await supabase.from('banners').update({ ativo: !banner.ativo }).eq('id', banner.id);
    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message });
    } else {
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, ativo: !banner.ativo } : b)));
    }
  };

  const deleteBanner = async (banner: Banner) => {
    if (!confirm('Excluir este banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', banner.id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message });
    } else {
      toast({ title: 'Banner excluído' });
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    }
  };

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

      {/* Banners */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Banners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="bimg">Imagem URL</Label>
                <Input id="bimg" placeholder="https://..." value={bImagemUrl} onChange={(e) => setBImagemUrl(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="blink">Link de redirecionamento (opcional)</Label>
                <Input id="blink" placeholder="https://..." value={bLink} onChange={(e) => setBLink(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="btam">Tamanho (ex: 1200x400)</Label>
                <Input id="btam" placeholder="ex: 1200x400" value={bTamanho} onChange={(e) => setBTamanho(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="bativo" checked={bAtivo} onCheckedChange={setBAtivo} />
                <Label htmlFor="bativo">Ativo</Label>
              </div>
              <div className="md:col-span-5">
                <Button onClick={createBanner} disabled={bLoading}>Criar banner</Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((b) => (
                <Card key={b.id} className="hover:shadow-md transition">
                  <CardHeader>
                    <CardTitle className="text-base">{b.tamanho || 'Banner'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <img src={b.imagem_url} alt={`Banner ${b.tamanho || 'padrão'}`} className="w-full h-40 object-cover rounded" loading="lazy" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={b.ativo} onCheckedChange={() => toggleAtivo(b)} id={`ativo-${b.id}`} />
                        <Label htmlFor={`ativo-${b.id}`} className="text-sm">Ativo</Label>
                      </div>
                      <div className="flex gap-2">
                        {b.link_redirecionamento && (
                          <Button asChild variant="secondary" size="sm">
                            <a href={b.link_redirecionamento} target="_blank" rel="noopener noreferrer">Abrir</a>
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => deleteBanner(b)}>Excluir</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {banners.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum banner cadastrado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Google Drive */}
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
