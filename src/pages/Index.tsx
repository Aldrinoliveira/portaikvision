import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "@/hooks/use-toast";
import { QrCode, HelpCircle, Search } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Skeleton } from "@/components/ui/skeleton";

// Home SEO
const useSEO = () => {
  useEffect(() => {
    document.title = "Portal de Arquivos – Firmware, Documentos e Vídeos";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Busque por número de série ou part number e baixe firmwares, documentos e vídeos de produtos.");
  }, []);
};

interface Banner { id: string; imagem_url: string; tamanho: string | null; link_redirecionamento: string | null; ativo: boolean; }
interface Produto { id: string; partnumber: string; descricao: string | null; imagem_url: string | null; }

const Index = () => {
  useSEO();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [mode, setMode] = useState<"serie" | "part">("part");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const RESULTS_PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  // Solicitação de firmware modal
  const [openRequest, setOpenRequest] = useState(false);
  const [reqSerie, setReqSerie] = useState("");
  const [reqProduto, setReqProduto] = useState("");
  const [reqDesc, setReqDesc] = useState("");

  // QR Code modal
  const [openQR, setOpenQR] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const loadBanners = async () => {
      const { data } = await supabase.from("banners").select("*").eq("ativo", true).order("created_at", { ascending: false });
      setBanners(data || []);
    };
    loadBanners();
  }, []);

  useEffect(() => {
    if (openQR) {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      codeReader
        .decodeFromVideoDevice(undefined, videoRef.current as any, (result, err) => {
          if (result) {
            const text = result.getText();
            setQuery(text.slice(0, 9));
            setOpenQR(false);
            toast({ title: "QR lido", description: `Número: ${text}` });
          }
        })
        .catch(() => {});
    }
    return () => {
      try {
        const mediaStream = (videoRef.current as any)?.srcObject as MediaStream | undefined;
        mediaStream?.getTracks()?.forEach((t) => t.stop());
      } catch {}
      codeReaderRef.current = null;
    };
  }, [openQR]);

  const onSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setPage(1);
    try {
      if (mode === "serie") {
        const { data: nums } = await supabase
          .from("numeros_serie")
          .select("produto_id")
          .eq("numero_serie", query.trim());
        const ids = (nums || []).map((n: any) => n.produto_id);
        if (ids.length === 0) {
          // Fallback: tentar por partnumber quando não achar por série
          const { data: prods } = await supabase
            .from("produtos")
            .select("id, partnumber, descricao, imagem_url")
            .ilike("partnumber", `%${query.trim()}%`);
          setResults(prods || []);
        } else {
          const { data: prods } = await supabase
            .from("produtos")
            .select("id, partnumber, descricao, imagem_url")
            .in("id", ids);
          setResults(prods || []);
        }
      } else {
        const { data: prods } = await supabase
          .from("produtos")
          .select("id, partnumber, descricao, imagem_url")
          .ilike("partnumber", `%${query.trim()}%`);
        setResults(prods || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const countsCache = useRef<Record<string, { firmware: number; documento: number; video: number }>>({});
  const getCounts = async (produtoId: string) => {
    if (countsCache.current[produtoId]) return countsCache.current[produtoId];
    const { data: files } = await supabase
      .from("arquivos")
      .select("categoria_arquivo")
      .eq("produto_id", produtoId);
    const c = { firmware: 0, documento: 0, video: 0 };
    (files || []).forEach((f: any) => {
      if (f.categoria_arquivo === "firmware") c.firmware++;
      else if (f.categoria_arquivo === "documento") c.documento++;
      else if (f.categoria_arquivo === "video") c.video++;
    });
    countsCache.current[produtoId] = c;
    return c;
  };

  const submitRequest = async () => {
    const payload = {
      numero_serie: reqSerie || null,
      produto_nome: reqProduto || null,
      descricao: reqDesc || null,
    };
    const { error } = await supabase.from("solicitacoes_firmware").insert(payload as any);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message });
    } else {
      toast({ title: "Solicitação enviada", description: "Obrigado! Entraremos em contato." });
      setOpenRequest(false);
      setReqDesc(""); setReqProduto(""); setReqSerie("");
    }
  };

  const TopBar = useMemo(() => (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">Portal de Arquivos</Link>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#produtos" className="hover:underline">Produtos</a>
          <a href="#software" className="hover:underline">Software</a>
          <a href="#ferramentas" className="hover:underline">Ferramentas</a>
          <Link to="/auth" className="hover:underline">Entrar</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </nav>
      </div>
    </header>
  ), []);

  const totalPages = Math.max(1, Math.ceil(results.length / RESULTS_PAGE_SIZE));
  const visibleResults = useMemo(() => {
    const start = (page - 1) * RESULTS_PAGE_SIZE;
    return results.slice(start, start + RESULTS_PAGE_SIZE);
  }, [results, page]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {TopBar}

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Banner Carousel */}
        {banners.length > 0 && (
          <section aria-label="Banner">
            <Carousel className="w-full">
              <CarouselContent>
                {banners.map((b) => (
                  <CarouselItem key={b.id}>
                    <a href={b.link_redirecionamento || "#"} target={b.link_redirecionamento ? "_blank" : "_self"} rel="noreferrer">
                      <img
                        src={b.imagem_url}
                        alt={`Banner ${b.tamanho || "padrão"}`}
                        loading="lazy"
                        className="w-full h-56 md:h-72 lg:h-96 object-cover rounded-md shadow"
                      />
                    </a>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Busca */}
        <section aria-label="Busca">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Buscar arquivos</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Ajuda">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Encontre o número de série no produto ou o part number na etiqueta da caixa.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant={mode === "serie" ? "default" : "outline"} onClick={() => setMode("serie")}>Número de Série</Button>
                <Button variant={mode === "part" ? "default" : "outline"} onClick={() => setMode("part")}>Part Number</Button>
              </div>
              <div className="flex flex-col md:flex-row items-stretch gap-3">
                <div className="flex-1">
                  <Label htmlFor="q" className="sr-only">{mode === "serie" ? "Número de Série" : "Part Number"}</Label>
                  <Input
                    id="q"
                    placeholder={mode === "serie" ? "Digite o número de série (máx. 9 dígitos)" : "Digite o part number"}
                    value={query}
                    maxLength={mode === "serie" ? 9 : undefined}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                {mode === "serie" && (
                  <Button variant="secondary" onClick={() => setOpenQR(true)}>
                    <QrCode className="h-4 w-4 mr-2" /> Ler QR Code
                  </Button>
                )}
                <Button onClick={onSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" /> {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={() => setOpenRequest(true)}>Não encontrei um firmware</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Resultados */}
        {loading && (
          <section aria-label="Resultados" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: RESULTS_PAGE_SIZE }).map((_, i) => (
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

        {!loading && results.length > 0 && (
          <section aria-label="Resultados" className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleResults.map((p) => (
                <Card key={p.id} className="overflow-hidden hover:shadow-md transition">
                  {p.imagem_url && (
                    <img src={p.imagem_url} alt={`Produto ${p.partnumber}`} loading="lazy" className="w-full h-40 object-cover" />
                  )}
                  <CardHeader>
                    <CardTitle className="text-base">{p.partnumber}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{p.descricao || ""}</p>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/produto/${p.id}`)}
                    >
                      Ver arquivos
                    </Button>
                    <AsyncCounts produtoId={p.id} getCounts={getCounts} />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
                <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Próxima</Button>
              </div>
            </div>
          </section>
        )}

        {/* Top Downloads - agora dinâmico */}
        <TopDownloads />
      </main>

      {/* Dialog QR */}
      <Dialog open={openQR} onOpenChange={setOpenQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ler QR Code</DialogTitle>
          </DialogHeader>
          <video ref={videoRef} className="w-full rounded-md" autoPlay muted playsInline />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenQR(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Solicitação */}
      <Dialog open={openRequest} onOpenChange={setOpenRequest}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Não encontrei um firmware</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <Label htmlFor="reqserie">Número de Série (opcional)</Label>
              <Input id="reqserie" value={reqSerie} onChange={(e) => setReqSerie(e.target.value)} maxLength={9} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="reqprod">Nome do Produto (opcional)</Label>
              <Input id="reqprod" value={reqProduto} onChange={(e) => setReqProduto(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="reqdesc">Descrição</Label>
              <Input id="reqdesc" value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRequest(false)}>Cancelar</Button>
            <Button onClick={submitRequest}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AsyncCounts = ({ produtoId, getCounts }: { produtoId: string; getCounts: (id: string) => Promise<{ firmware: number; documento: number; video: number }>; }) => {
  const [counts, setCounts] = useState<{ firmware: number; documento: number; video: number } | null>(null);
  useEffect(() => {
    getCounts(produtoId).then(setCounts);
  }, [produtoId]);
  if (!counts) return <div className="text-xs text-muted-foreground">Carregando contagens...</div>;
  return (
    <div className="text-xs text-muted-foreground">
      {counts.firmware} firmware • {counts.documento} documentos • {counts.video} vídeos
    </div>
  );
};

const TopDownloads = () => {
  const [items, setItems] = useState<Array<{ produto_id: string; total_downloads: number; partnumber: string; descricao: string | null; imagem_url: string | null }>>([]);
  useEffect(() => {
    const run = async () => {
      const { data: tops } = await supabase.from('vw_top_downloads').select('produto_id, total_downloads').limit(10);
      const ids = (tops || []).map((t: any) => t.produto_id);
      if (!ids.length) { setItems([]); return; }
      const { data: prods } = await supabase.from('produtos').select('id, partnumber, descricao, imagem_url').in('id', ids);
      const merged = (tops || []).map((t: any) => {
        const p = (prods || []).find((x: any) => x.id === t.produto_id);
        return { produto_id: t.produto_id, total_downloads: Number(t.total_downloads), partnumber: p?.partnumber, descricao: p?.descricao, imagem_url: p?.imagem_url };
      });
      setItems(merged);
    };
    run();
  }, []);
  if (!items.length) return null;
  return (
    <section aria-label="Top Downloads" className="space-y-3">
      <h2 className="text-xl font-semibold">Top Downloads</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <Card key={it.produto_id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>{it.partnumber}</span>
                <span className="text-xs text-muted-foreground">{it.total_downloads} downloads</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 items-center">
              {it.imagem_url && <img src={it.imagem_url} alt={`Produto ${it.partnumber}`} className="w-24 h-16 object-cover rounded" loading="lazy" />}
              <p className="text-sm text-muted-foreground line-clamp-3">{it.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Index;
