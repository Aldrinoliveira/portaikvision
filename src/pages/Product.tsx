import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Produto { id: string; partnumber: string; descricao: string | null; imagem_url: string | null; }
interface Arquivo { id: string; categoria_arquivo: string; nome_arquivo: string; link_url: string; downloads: number; }

const useSEO = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
};

const Product = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);

  useSEO("Produto – Arquivos", "Veja firmwares, documentos e vídeos para o produto.");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: p } = await supabase.from("produtos").select("id, partnumber, descricao, imagem_url").eq("id", id).maybeSingle();
      setProduto(p as any);
      const { data: f } = await supabase.from("arquivos").select("id, categoria_arquivo, nome_arquivo, link_url, downloads").eq("produto_id", id).order("created_at", { ascending: false });
      setArquivos(f || []);
    };
    load();
  }, [id]);

  const grouped = useMemo(() => {
    const g: Record<string, Arquivo[]> = { firmware: [], documento: [], video: [] } as any;
    arquivos.forEach(a => { (g[a.categoria_arquivo] = g[a.categoria_arquivo] || []).push(a); });
    return g;
  }, [arquivos]);

  if (!produto) return <div className="container mx-auto px-4 py-10">Carregando...</div>;

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <section className="grid md:grid-cols-2 gap-6 items-start">
        {produto.imagem_url && (
          <img src={produto.imagem_url} alt={`Imagem do produto ${produto.partnumber}`} className="w-full rounded-md object-cover max-h-80" loading="lazy" />
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
                <CardContent className="flex items-center justify-between">
                  <a href={a.link_url} target="_blank" rel="noreferrer">
                    <Button>Download</Button>
                  </a>
                  <span className="text-xs text-muted-foreground">{a.downloads} downloads</span>
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
  );
};

export default Product;
