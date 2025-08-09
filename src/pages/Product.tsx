import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";

interface Produto { id: string; partnumber: string; descricao: string | null; imagem_url: string | null; }
interface Arquivo { id: string; categoria_arquivo: string; nome_arquivo: string; descricao: string | null; link_url: string; downloads: number; created_at: string; }


const useSEO = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
};

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  

  useSEO("Produto – Arquivos", "Veja firmwares, documentos e vídeos para o produto.");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: p } = await supabase.from("produtos").select("id, partnumber, descricao, imagem_url").eq("id", id).maybeSingle();
      setProduto(p as any);
      const { data: f } = await supabase.from("arquivos").select("id, categoria_arquivo, nome_arquivo, descricao, link_url, downloads, created_at").eq("produto_id", id).order("created_at", { ascending: false });
      setArquivos(f || []);
    };
    load();
  }, [id]);



  const grouped = useMemo(() => {
    const g: Record<string, Arquivo[]> = { firmware: [], documento: [], video: [] } as any;
    arquivos.forEach(a => { (g[a.categoria_arquivo] = g[a.categoria_arquivo] || []).push(a); });
    return g;
  }, [arquivos]);

  const handleDownload = async (a: Arquivo) => {
    const { data, error } = await supabase.rpc('increment_downloads', { _arquivo_id: a.id });
    if (error) {
      toast({ title: 'Erro ao contabilizar download', description: error.message });
      window.open(a.link_url, '_blank', 'noopener');
      return;
    }
    const link = Array.isArray(data) ? data[0]?.link_url : (data as any)?.link_url;
    window.open(link || a.link_url, '_blank', 'noopener');
  };

  if (!produto) return <div className="container mx-auto px-4 py-10">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <Button variant="outline" onClick={() => navigate(-1)} aria-label="Voltar" className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
      <section className="grid md:grid-cols-2 gap-6 items-start">
        {produto.imagem_url && (
          <img src={produto.imagem_url} alt={`Imagem do produto ${produto.partnumber}`} className="w-28 h-28 md:w-40 md:h-40 rounded-md object-cover" loading="lazy" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{produto.partnumber}</h1>
          <p className="text-muted-foreground mt-2">{produto.descricao}</p>
        </div>
      </section>

      {(["firmware", "documento", "video"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-xl font-semibold capitalize">{cat}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(grouped[cat] || []).map((a) => (
              <Card key={a.id} className="hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-base">{a.nome_arquivo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {a.descricao && (
                    <p className="text-sm text-muted-foreground">{a.descricao}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Button onClick={() => handleDownload(a)}>Download</Button>
                    <div className="text-right">
                      <span className="block text-xs text-muted-foreground">{a.downloads} downloads</span>
                      <span className="block text-xs text-muted-foreground">Adicionado em {new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(grouped[cat] || []).length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum arquivo de {cat}.</p>
            )}
          </div>
        </section>
      ))}


    </main>
      <Footer />
    </div>
  );
};

export default Product;
