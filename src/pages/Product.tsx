import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  
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

  const getVideoThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0] 
        : url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

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
      <section className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {produto.imagem_url && (
          <img
            src={produto.imagem_url}
            alt={`Imagem do produto ${produto.partnumber}`}
            className="w-28 h-28 md:w-40 md:h-40 rounded-md object-cover"
            loading="lazy"
          />
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{produto.partnumber}</h1>
          {produto.descricao && <p className="text-muted-foreground">{produto.descricao}</p>}
        </div>
      </section>

      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as "cards" | "list")}
          aria-label="Modo de visualização"
        >
          <ToggleGroupItem value="cards" aria-label="Cards">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Lista">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {(["firmware", "documento", "video"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-xl font-semibold capitalize">{cat === "firmware" ? "Arquivos" : cat}</h2>
          {viewMode === "cards" ? (
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
                     {cat === "video" ? (
                       <div className="space-y-2">
                         {getVideoThumbnail(a.link_url) && (
                           <div 
                             className="relative cursor-pointer rounded-md overflow-hidden group"
                             onClick={() => handleDownload(a)}
                           >
                              <img 
                                src={getVideoThumbnail(a.link_url)!} 
                                alt={`Capa do vídeo ${a.nome_arquivo}`}
                                className="w-1/2 h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                              />
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                               <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                                 <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                               </div>
                             </div>
                           </div>
                         )}
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium">Assistir vídeo</span>
                           <div className="text-right">
                             <span className="block text-xs text-muted-foreground">{a.downloads} visualizações</span>
                             <span className="block text-xs text-muted-foreground">Adicionado em {new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                           </div>
                         </div>
                       </div>
                     ) : (
                       <div className="flex items-center justify-between">
                         <Button onClick={() => handleDownload(a)}>Download</Button>
                         <div className="text-right">
                           <span className="block text-xs text-muted-foreground">{a.downloads} downloads</span>
                           <span className="block text-xs text-muted-foreground">Adicionado em {new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                         </div>
                       </div>
                     )}
                   </CardContent>
                </Card>
              ))}
              {(grouped[cat] || []).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum arquivo de {cat}.</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border divide-y">
              {(grouped[cat] || []).map((a) => (
                 <div key={a.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3">
                   {cat === "video" && getVideoThumbnail(a.link_url) ? (
                     <div className="flex gap-3 w-full">
                       <div 
                         className="relative cursor-pointer rounded-md overflow-hidden group flex-shrink-0"
                         onClick={() => handleDownload(a)}
                       >
                          <img 
                            src={getVideoThumbnail(a.link_url)!} 
                            alt={`Capa do vídeo ${a.nome_arquivo}`}
                            className="w-10 h-12 object-cover group-hover:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                           <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                             <div className="w-0 h-0 border-l-[4px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
                           </div>
                         </div>
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className="font-medium truncate">{a.nome_arquivo}</p>
                         {a.descricao && (
                           <p className="text-sm text-muted-foreground line-clamp-2">{a.descricao}</p>
                         )}
                         <div className="mt-1 text-xs text-muted-foreground">
                           {a.downloads} visualizações • Adicionado em {new Date(a.created_at).toLocaleDateString('pt-BR')}
                         </div>
                       </div>
                     </div>
                   ) : (
                     <>
                       <div className="min-w-0">
                         <p className="font-medium truncate">{a.nome_arquivo}</p>
                         {a.descricao && (
                           <p className="text-sm text-muted-foreground line-clamp-2">{a.descricao}</p>
                         )}
                         <div className="mt-1 text-xs text-muted-foreground">
                           {a.downloads} downloads • Adicionado em {new Date(a.created_at).toLocaleDateString('pt-BR')}
                         </div>
                       </div>
                       <div className="flex-shrink-0">
                         <Button onClick={() => handleDownload(a)}>Download</Button>
                       </div>
                     </>
                   )}
                 </div>
              ))}
              {(grouped[cat] || []).length === 0 && (
                <p className="text-sm text-muted-foreground p-3">Nenhum arquivo de {cat}.</p>
              )}
            </div>
          )}
        </section>
      ))}


    </main>
      <Footer />
    </div>
  );
};

export default Product;
