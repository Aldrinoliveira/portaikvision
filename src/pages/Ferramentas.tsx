import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, FileText, Video, ArrowLeft } from "lucide-react";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";

interface Produto { id: string; partnumber: string; descricao: string | null; imagem_url: string | null; categoria_id?: string | null; }
interface Categoria { id: string; nome: string; }

const useSEO = () => {
  useEffect(() => {
    document.title = "Ferramentas – Hikvision";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Baixe ferramentas e utilitários dos produtos Hikvision.");
  }, []);
};

const Ferramentas = () => {
  useSEO();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: categorias, error: catErr } = await supabase.from('categorias').select('id, nome');
        if (catErr) throw catErr;
        const cat = (categorias || []).find((c: Categoria) => c.nome.toLowerCase() === 'ferramentas');
        if (!cat) {
          setError("Categoria 'Ferramentas' não encontrada.");
          setProdutos([]);
          return;
        }
        const { data: prods, error: pErr } = await supabase
          .from('produtos')
          .select('id, partnumber, descricao, imagem_url, categoria_id')
          .eq('categoria_id', cat.id)
          .order('created_at', { ascending: false });
        if (pErr) throw pErr;
        setProdutos(prods || []);
      } catch (e: any) {
        setError(e?.message || 'Erro ao carregar ferramentas');
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <TopBar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <Button variant="outline" onClick={() => navigate(-1)} aria-label="Voltar" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
        <header>
          <h1 className="text-2xl font-semibold">Ferramentas</h1>
          <p className="text-muted-foreground mt-1">Downloads de ferramentas e utilitários para produtos Hikvision.</p>
        </header>

        {loading && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={`s-${i}`} className="overflow-hidden">
                <Skeleton className="w-full h-40" />
                <CardContent className="space-y-2 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {!loading && error && (
          <section className="py-10">
            <p className="text-sm text-muted-foreground">{error}</p>
          </section>
        )}

        {!loading && !error && produtos.length === 0 && (
          <section className="py-10">
            <p className="text-sm text-muted-foreground">Nenhuma ferramenta disponível.</p>
          </section>
        )}

        {!loading && !error && produtos.length > 0 && (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition animate-fade-in p-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => navigate(`/produto/${p.id}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/produto/${p.id}`); }}>
                <div className="flex items-center gap-3">
                  {p.imagem_url ? (
                    <img
                      src={p.imagem_url}
                      alt={`Produto ${p.partnumber}`}
                      loading="lazy"
                      className="w-20 h-20 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-muted" aria-hidden="true" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h2 className="text-sm font-medium leading-none">{p.partnumber}</h2>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao || ''}</p>
                    </div>
                    <div className="flex items-center justify-start">
                      <div className="text-[11px] text-muted-foreground">
                        <AsyncCounts produtoId={p.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

const AsyncCounts = ({ produtoId }: { produtoId: string }) => {
  const [counts, setCounts] = useState<{ firmware: number; documento: number; video: number } | null>(null);
  useEffect(() => {
    const fetchCounts = async () => {
      const { data: files } = await supabase
        .from('arquivos')
        .select('categoria_arquivo')
        .eq('produto_id', produtoId)
        .eq('listado', true);
      const c = { firmware: 0, documento: 0, video: 0 };
      (files || []).forEach((f: any) => {
        if (f.categoria_arquivo === 'firmware') c.firmware++;
        else if (f.categoria_arquivo === 'documento') c.documento++;
        else if (f.categoria_arquivo === 'video') c.video++;
      });
      setCounts(c);
    };
    fetchCounts();
  }, [produtoId]);
  if (!counts) return <div className="text-sm text-muted-foreground">Carregando...</div>;
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground leading-none">
      <span className="inline-flex items-center gap-1.5" aria-label={`${counts.firmware} firmware`}>
        <Cpu className="h-6 w-6" /> <span className="font-semibold">{counts.firmware}</span>
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`${counts.documento} documentos`}>
        <FileText className="h-6 w-6" /> <span className="font-semibold">{counts.documento}</span>
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`${counts.video} vídeos`}>
        <Video className="h-6 w-6" /> <span className="font-semibold">{counts.video}</span>
      </span>
    </div>
  );
};

export default Ferramentas;
