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
import type { CarouselApi } from "@/components/ui/carousel";
import { toast } from "@/hooks/use-toast";
import { QrCode, HelpCircle, Search, Cpu, FileText, Video, X } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
// Home SEO
const useSEO = () => {
  useEffect(() => {
    document.title = "Hikvision – Firmware, Documentos e Vídeos";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Busque por número de série ou part number e baixe firmwares, documentos e vídeos de produtos Hikvision.");
  }, []);
};
interface Banner {
  id: string;
  imagem_url: string;
  tamanho: string | null;
  link_redirecionamento: string | null;
  ativo: boolean;
  titulo?: string | null;
  descricao?: string | null;
}
interface Produto {
  id: string;
  partnumber: string;
  descricao: string | null;
  imagem_url: string | null;
  categoria_id?: string | null;
}
interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
}
const Index = () => {
  useSEO();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [mode, setMode] = useState<"serie" | "part">("part");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Produto[]>([]);
  const [allProducts, setAllProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const RESULTS_PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [catFilter, setCatFilter] = useState("");
  const [embla, setEmbla] = useState<CarouselApi | null>(null);
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [searched, setSearched] = useState(false);

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
    const load = async () => {
      const [bRes, cRes, pRes] = await Promise.all([supabase.from("banners").select("*").eq("ativo", true).order("created_at", {
        ascending: false
      }), supabase.from("categorias").select("id,nome,descricao").order("nome"), supabase.from("produtos").select("id, partnumber, descricao, imagem_url, categoria_id").order("created_at", {
        ascending: false
      }).limit(1000)]);
      setBanners(bRes.data || []);
      setCategorias(cRes.data || []);
      setResults(pRes.data || []);
      setAllProducts(pRes.data || []);
    };
    load();
  }, []);
  useEffect(() => {
    if (!openQR) return;
    let unsub: (() => void) | null = null;
    const init = async () => {
      try {
        // Aguarda o <video> montar
        for (let i = 0; i < 10 && !videoRef.current; i++) {
          await new Promise(r => setTimeout(r, 50));
        }
        if (!videoRef.current) throw new Error("Falha ao inicializar a câmera (vídeo não montado)");

        // Solicita permissão rapidamente (melhora UX no iOS/Safari)
        if (navigator.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: "environment"
              }
            });
            (videoRef.current as any).srcObject = stream;
          } catch (e) {
            // Ignora aqui; ZXing tentará novamente. Apenas segue para iniciar o leitor.
          }
        }
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;

        // Tenta escolher a câmera traseira quando disponível
        let deviceId: string | undefined = undefined;
        try {
          const devices = await BrowserMultiFormatReader.listVideoInputDevices();
          if (devices?.length) {
            const back = devices.find(d => /back|rear|environment/i.test(d.label));
            deviceId = (back || devices[devices.length - 1]).deviceId;
          }
        } catch {}
        await codeReader.decodeFromVideoDevice(deviceId, videoRef.current as any, result => {
          if (result) {
            const text = result.getText();
            setQuery(text.slice(0, 9));
            setOpenQR(false);
            toast({
              title: "QR lido",
              description: `Número: ${text}`
            });
          }
        });
        unsub = () => {};
      } catch (err: any) {
        const msg = err?.message || "Não foi possível acessar a câmera. Verifique as permissões do navegador.";
        toast({
          title: "Erro ao abrir câmera",
          description: msg
        });
      }
    };
    init();
    return () => {
      try {
        const mediaStream = (videoRef.current as any)?.srcObject as MediaStream | undefined;
        mediaStream?.getTracks()?.forEach(t => t.stop());
      } catch {}
      try {
        unsub?.();
      } catch {}
      codeReaderRef.current = null;
    };
  }, [openQR]);
  const onSearch = async () => {
    if (!query.trim()) {
      setSearched(false);
      setResults(allProducts);
      setPage(1);
      return;
    }
    setLoading(true);
    setSearched(true);
    setPage(1);
    try {
      if (mode === "serie") {
        const {
          data: nums
        } = await supabase.from("numeros_serie").select("produto_id").eq("numero_serie", query.trim());
        const ids = (nums || []).map((n: any) => n.produto_id);
        if (ids.length === 0) {
          // Fallback: tentar por partnumber quando não achar por série
          const {
            data: prods
          } = await supabase.from("produtos").select("id, partnumber, descricao, imagem_url, categoria_id").ilike("partnumber", `%${query.trim()}%`);
          setResults(prods || []);
        } else {
          const {
            data: prods
          } = await supabase.from("produtos").select("id, partnumber, descricao, imagem_url, categoria_id").in("id", ids);
          setResults(prods || []);
        }
      } else {
        const {
          data: prods
        } = await supabase.from("produtos").select("id, partnumber, descricao, imagem_url, categoria_id").ilike("partnumber", `%${query.trim()}%`);
        setResults(prods || []);
      }
    } finally {
      setLoading(false);
    }
  };
  const countsCache = useRef<Record<string, {
    firmware: number;
    documento: number;
    video: number;
  }>>({});
  const getCounts = async (produtoId: string) => {
    if (countsCache.current[produtoId]) return countsCache.current[produtoId];
    const {
      data: files
    } = await supabase.from("arquivos").select("categoria_arquivo").eq("produto_id", produtoId).eq("listado", true);
    const c = {
      firmware: 0,
      documento: 0,
      video: 0
    };
    (files || []).forEach((f: any) => {
      if (f.categoria_arquivo === "firmware") c.firmware++;else if (f.categoria_arquivo === "documento") c.documento++;else if (f.categoria_arquivo === "video") c.video++;
    });
    countsCache.current[produtoId] = c;
    return c;
  };
  const submitRequest = async () => {
    const payload = {
      numero_serie: reqSerie || null,
      produto_nome: reqProduto || null,
      descricao: reqDesc || null
    };
    const {
      error
    } = await supabase.from("solicitacoes_firmware").insert(payload as any);
    if (error) {
      toast({
        title: "Erro ao enviar",
        description: error.message
      });
    } else {
      toast({
        title: "Solicitação enviada",
        description: "Obrigado! Entraremos em contato."
      });
      setOpenRequest(false);
      setReqDesc("");
      setReqProduto("");
      setReqSerie("");
    }
  };
  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    const onReInit = () => {
      setSnapCount(embla.scrollSnapList().length);
      onSelect();
    };
    setSnapCount(embla.scrollSnapList().length);
    onSelect();
    embla.on('select', onSelect);
    embla.on('reInit', onReInit);
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onReInit);
    };
  }, [embla]);
  useEffect(() => {
    if (query.trim() === '') {
      setResults(allProducts);
      setSearched(false);
      setPage(1);
    }
  }, [query, allProducts]);
  const excludedCategoryIds = useMemo(() => categorias.filter(c => /^(software|ferramentas)$/i.test((c.nome || '').trim())).map(c => c.id), [categorias]);
  const baseResults = useMemo(() => results.filter(p => !excludedCategoryIds.includes((p.categoria_id || '') as string)), [results, excludedCategoryIds]);
  const filtered = useMemo(() => catFilter ? baseResults.filter(p => p.categoria_id === catFilter) : baseResults, [baseResults, catFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / RESULTS_PAGE_SIZE));
  const visibleResults = useMemo(() => {
    const start = (page - 1) * RESULTS_PAGE_SIZE;
    return filtered.slice(start, start + RESULTS_PAGE_SIZE);
  }, [filtered, page]);
  return <div className="min-h-screen bg-background text-foreground">
      <TopBar />

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* Banner Carousel */}
        {banners.length > 0 && <section aria-label="Banner" className="animate-fade-in">
            <Carousel className="w-full" plugins={[Autoplay({
          delay: 4000,
          stopOnInteraction: true
        })]} setApi={setEmbla}>
              <CarouselContent>
                {banners.map(b => <CarouselItem key={b.id}>
                    {b.link_redirecionamento?.startsWith('/') ? <Link to={b.link_redirecionamento}>
                        <div className="relative">
                          <img src={b.imagem_url} alt={`Banner: ${b.titulo || b.tamanho || "padrão"}`} loading="lazy" className="w-full h-56 md:h-72 lg:h-96 object-cover rounded-md" />
                        </div>
                      </Link> : <a href={b.link_redirecionamento || "#"} target={b.link_redirecionamento ? "_blank" : "_self"} rel="noreferrer">
                        <div className="relative">
                          <img src={b.imagem_url} alt={`Banner: ${b.titulo || b.tamanho || "padrão"}`} loading="lazy" className="w-full h-56 md:h-72 lg:h-96 object-cover rounded-md" />
                        </div>
                      </a>}
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
            <div className="mt-3 flex justify-center gap-2">
              {Array.from({
            length: snapCount
          }).map((_, i) => <button key={i} type="button" aria-label={`Ir para banner ${i + 1}`} data-active={selected === i} onClick={() => embla?.scrollTo(i)} className="h-2.5 w-2.5 rounded-full bg-foreground/30 data-[active=true]:bg-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />)}
            </div>
          </section>}

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
                <div className="flex-1 relative">
                  <Label htmlFor="q" className="sr-only">{mode === "serie" ? "Número de Série" : "Part Number"}</Label>
                  <Input id="q" placeholder={mode === "serie" ? "Digite o número de série (máx. 9 dígitos)" : "Digite o part number"} value={query} maxLength={mode === "serie" ? 9 : undefined} onChange={e => setQuery(e.target.value)} className="pr-10" />
                  {query && <button type="button" aria-label="Limpar pesquisa" onClick={() => {
                  setQuery('');
                  setSearched(false);
                  setResults(allProducts);
                  setPage(1);
                }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>}
                </div>
                {mode === "serie" && <Button variant="secondary" onClick={() => setOpenQR(true)}>
                    <QrCode className="h-4 w-4 mr-2" /> Ler QR Code
                  </Button>}
                <Button onClick={onSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" /> {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button variant="outline" onClick={() => setOpenRequest(true)}>Não encontrei um firmware</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Filtros por categoria */}
        {categorias.length > 0 && <section aria-label="Filtros" className="animate-fade-in">
            <div className="flex flex-wrap gap-2">
              <Button variant={catFilter === "" ? "default" : "outline"} size="sm" onClick={() => {
            setCatFilter("");
            setPage(1);
          }}>Todas</Button>
              {categorias.filter(c => !/^(software|ferramentas)$/i.test(c.nome.trim())).map(c => <Button key={c.id} variant={catFilter === c.id ? "default" : "outline"} size="sm" onClick={() => {
            setCatFilter(c.id);
            setPage(1);
          }}>
                    {c.nome}
                  </Button>)}
            </div>
          </section>}

        {/* Resultados */}
        {loading && <section aria-label="Resultados" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({
          length: RESULTS_PAGE_SIZE
        }).map((_, i) => <Card key={`s-${i}`} className="overflow-hidden">
                <Skeleton className="w-full h-40" />
                <CardContent className="space-y-2 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>)}
          </section>}

        {!loading && results.length > 0 && <section aria-label="Resultados" className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleResults.map(p => <Card key={p.id} className="hover:shadow-md transition animate-fade-in p-3 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => navigate(`/produto/${p.id}`)} role="button" tabIndex={0} onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') navigate(`/produto/${p.id}`);
          }}>
                  <div className="flex items-center gap-3">
                    {p.imagem_url ? <img src={p.imagem_url} alt={`Produto ${p.partnumber}`} loading="lazy" className="w-20 h-20 rounded-md object-cover" /> : <div className="w-20 h-20 rounded-md bg-muted" aria-hidden="true" />}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-sm font-medium leading-none">{p.partnumber}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao || ""}</p>
                      </div>
                      <div className="flex items-center justify-start">
                        <div className="text-[11px] text-muted-foreground">
                          <AsyncCounts produtoId={p.id} getCounts={getCounts} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
                <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Próxima</Button>
              </div>
            </div>
          </section>}

        {!loading && searched && filtered.length === 0 && <section aria-label="Sem resultados" className="py-10 text-center">
            <p className="text-sm text-muted-foreground">Sem resultados para essa pesquisa.</p>
          </section>}

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
              <Input id="reqserie" value={reqSerie} onChange={e => setReqSerie(e.target.value)} maxLength={9} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="reqprod">Nome do Produto (opcional)</Label>
              <Input id="reqprod" value={reqProduto} onChange={e => setReqProduto(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="reqdesc">Descrição</Label>
              <Input id="reqdesc" value={reqDesc} onChange={e => setReqDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRequest(false)}>Cancelar</Button>
            <Button onClick={submitRequest}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>;
};
const AsyncCounts = ({
  produtoId,
  getCounts
}: {
  produtoId: string;
  getCounts: (id: string) => Promise<{
    firmware: number;
    documento: number;
    video: number;
  }>;
}) => {
  const [counts, setCounts] = useState<{
    firmware: number;
    documento: number;
    video: number;
  } | null>(null);
  useEffect(() => {
    getCounts(produtoId).then(setCounts);
  }, [produtoId]);
  if (!counts) return <div className="text-sm text-muted-foreground">Carregando...</div>;
  return <div className="flex items-center gap-3 text-sm text-muted-foreground leading-none">
      <span className="inline-flex items-center gap-1.5" aria-label={`${counts.firmware} firmware`}>
        <Cpu className="h-6 w-6" /> <span className="font-semibold">{counts.firmware}</span>
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`${counts.documento} documentos`}>
        <FileText className="h-6 w-6" /> <span className="font-semibold">{counts.documento}</span>
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label={`${counts.video} vídeos`}>
        <Video className="h-6 w-6" /> <span className="font-semibold">{counts.video}</span>
      </span>
    </div>;
};
const TopDownloads = () => {
  type FileInfo = {
    id: string;
    produto_id: string;
    nome_arquivo: string;
    descricao: string | null;
    link_url: string;
    categoria_arquivo: string;
    downloads: number;
  };
  type Item = {
    produto_id: string;
    total_downloads: number;
    partnumber?: string;
    descricao?: string | null;
    imagem_url?: string | null;
    file?: FileInfo;
  };
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    const run = async () => {
      const {
        data: tops
      } = await supabase.from('vw_top_downloads').select('produto_id, total_downloads').order('total_downloads', {
        ascending: false
      }).limit(10);
      const ids = (tops || []).map((t: any) => t.produto_id);
      if (!ids.length) {
        setItems([]);
        return;
      }

      // Apenas produtos que possuem arquivos listados
      const {
        data: allowed
      } = await supabase.from('arquivos').select('produto_id').eq('listado', true).in('produto_id', ids);
      const allowedIds = Array.from(new Set((allowed || []).map((a: any) => a.produto_id)));
      const filteredTops = (tops || []).filter((t: any) => allowedIds.includes(t.produto_id));
      if (!filteredTops.length) {
        setItems([]);
        return;
      }

      // Dados dos produtos
      const {
        data: prods
      } = await supabase.from('produtos').select('id, partnumber, descricao, imagem_url').in('id', filteredTops.map((t: any) => t.produto_id));

      // Buscar o arquivo mais baixado de cada produto (listado=true)
      const {
        data: arqs
      } = await supabase.from('arquivos').select('id, produto_id, nome_arquivo, descricao, link_url, categoria_arquivo, downloads').eq('listado', true).in('produto_id', filteredTops.map((t: any) => t.produto_id)).order('produto_id', {
        ascending: true
      }).order('downloads', {
        ascending: false
      });
      const topByProduto: Record<string, FileInfo> = {};
      (arqs || []).forEach((a: any) => {
        if (!topByProduto[a.produto_id]) topByProduto[a.produto_id] = a as FileInfo;
      });
      const merged: Item[] = filteredTops.map((t: any) => {
        const p = (prods || []).find((x: any) => x.id === t.produto_id);
        return {
          produto_id: t.produto_id,
          total_downloads: Number(t.total_downloads),
          partnumber: p?.partnumber,
          descricao: p?.descricao ?? null,
          imagem_url: p?.imagem_url ?? null,
          file: topByProduto[t.produto_id]
        };
      });
      setItems(merged);
    };
    run();
  }, []);
  if (!items.length) return null;
  const openFile = (url?: string) => {
    if (!url) {
      toast({
        title: 'Arquivo indisponível',
        description: 'Nenhum arquivo listado para este produto.'
      });
      return;
    }
    window.open(url, '_blank', 'noopener');
  };
  return <section aria-label="Top Downloads" className="space-y-3">
      <h2 className="text-xl font-semibold">Top Downloads</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(it => <Card key={it.produto_id} className="hover:shadow-md transition hover-scale animate-fade-in cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => openFile(it.file?.link_url)} role="button" tabIndex={0} onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') openFile(it.file?.link_url);
      }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {it.imagem_url && <img src={it.imagem_url} alt={`Produto ${it.partnumber}`} className="w-16 h-16 object-cover rounded" loading="lazy" />}
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">{it.partnumber}</CardTitle>
                  {it.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{it.descricao}</p>}
                </div>
                <span aria-label={`${it.total_downloads} downloads`} className="text-xs text-muted-foreground whitespace-nowrap mx-[10px]">
                  {it.total_downloads} downloads
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-w-0 space-y-1">
                {it.file && <div className="text-sm">
                    <p className="font-medium truncate" title={it.file.nome_arquivo}>{it.file.nome_arquivo}</p>
                    {it.file.descricao && <p className="text-muted-foreground line-clamp-2" title={it.file.descricao}>{it.file.descricao}</p>}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      {it.file.categoria_arquivo === 'firmware' ? <Cpu className="h-4 w-4" /> : it.file.categoria_arquivo === 'documento' ? <FileText className="h-4 w-4" /> : it.file.categoria_arquivo === 'video' ? <Video className="h-4 w-4" /> : null}
                      <span className="capitalize">{it.file.categoria_arquivo}</span>
                    </div>
                  </div>}
              </div>
            </CardContent>
          </Card>)}
      </div>
    </section>;
};
export default Index;