import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Bell } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const Admin = () => {
  const navigate = useNavigate();

  // Types

  type Banner = {
    id: string;
    imagem_url: string;
    tamanho: string | null;
    link_redirecionamento: string | null;
    ativo: boolean;
    titulo?: string | null;
    descricao?: string | null;
  };
  type Categoria = {
    id: string;
    nome: string;
    descricao: string | null;
  };
  type Subcategoria = {
    id: string;
    nome: string;
    descricao: string | null;
    categoria_id: string;
  };
  type Produto = {
    id: string;
    partnumber: string;
    descricao: string | null;
    imagem_url: string | null;
    categoria_id: string;
    subcategoria_id: string | null;
  };
  type Arquivo = {
    id: string;
    produto_id: string;
    nome_arquivo: string;
    descricao: string | null;
    categoria_arquivo: string;
    link_url: string;
    downloads: number;
    created_at: string;
    listado: boolean;
  };
  type NumeroSerie = {
    id: string;
    produto_id: string;
    numero_serie: string;
    created_at: string;
  };
  type Solicitacao = {
    id: string;
    created_at: string;
    numero_serie: string | null;
    produto_nome: string | null;
    descricao: string | null;
    status: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
  };
  // State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Banners
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bImagemUrl, setBImagemUrl] = useState("");
  const [bLink, setBLink] = useState("");
  const [bTamanho, setBTamanho] = useState("");
  const [bTitulo, setBTitulo] = useState("");
  const [bDescricao, setBDescricao] = useState("");
  const [bAtivo, setBAtivo] = useState(true);
  const [bLoading, setBLoading] = useState(false);
  // Categorias/Subcategorias/Produtos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  // Categoria form
  const [catNome, setCatNome] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatNome, setEditCatNome] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  // Subcategoria form
  const [subCat, setSubCat] = useState<string>("");
  const [subNome, setSubNome] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubCat, setEditSubCat] = useState<string>("");
  const [editSubNome, setEditSubNome] = useState("");
  const [editSubDesc, setEditSubDesc] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  // Produto form
  const [pPart, setPPart] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pImg, setPImg] = useState("");
  const [pCat, setPCat] = useState<string>("");
  const [pSub, setPSub] = useState<string>("");
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editPPart, setEditPPart] = useState("");
  const [editPDesc, setEditPDesc] = useState("");
  const [editPImg, setEditPImg] = useState("");
  const [editPCat, setEditPCat] = useState<string>("");
  const [editPSub, setEditPSub] = useState<string>("");
  const [prodLoading, setProdLoading] = useState(false);
  // Produtos list filters/pagination
  const [fPart, setFPart] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fCat, setFCat] = useState<string>("");
  const [fSub, setFSub] = useState<string>("");
  const PROD_PAGE_SIZE = 9;
  const [prodPage, setProdPage] = useState(1);
  const [prodTotal, setProdTotal] = useState(0);
  const [prodListLoading, setProdListLoading] = useState(false);
  const [prodFileCounts, setProdFileCounts] = useState<Record<string, number>>({});
  const [prodFilesMap, setProdFilesMap] = useState<Record<string, Arquivo[]>>({});

  // Arquivos form
  const [aProd, setAProd] = useState<string>("");
  const [aNome, setANome] = useState("");
  const [aTipo, setATipo] = useState<string>("");
  const [aDesc, setADesc] = useState("");
  const [aLink, setALink] = useState("");
  const [aNaoListado, setANaoListado] = useState(false);
  const [aLoading, setALoading] = useState(false);
  const [allProds, setAllProds] = useState<{
    id: string;
    partnumber: string;
  }[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [arqListLoading, setArqListLoading] = useState(false);
  const [editingArqId, setEditingArqId] = useState<string | null>(null);
  const [editAProd, setEditAProd] = useState<string>("");
  const [editANome, setEditANome] = useState("");
  const [editATipo, setEditATipo] = useState<string>("");
  const [editALink, setEditALink] = useState("");
  const [arqLoading, setArqLoading] = useState(false);
  const [editADesc, setEditADesc] = useState("");

  // Números de Série form/lista
  const [nsProduto, setNsProduto] = useState<string>("");
  const [nsNumero, setNsNumero] = useState("");
  const [nsLoading, setNsLoading] = useState(false);
  const [numerosSerie, setNumerosSerie] = useState<NumeroSerie[]>([]);
  const [nsListLoading, setNsListLoading] = useState(false);

  // Solicitações (Não Encontrei)
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [solLoading, setSolLoading] = useState(false);

  // Dashboard – Downloads
  const [dailyDate, setDailyDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [monthSel, setMonthSel] = useState<string>(new Date().toISOString().slice(0, 7));
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [dailySeries, setDailySeries] = useState<{
    date: string;
    dateLabel: string;
    count: number;
  }[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  // Site Settings (banner textos)
  type SiteSettings = {
    id: string;
    banner_title_color: string | null;
    banner_desc_color: string | null;
    banner_title_size: string | null;
    banner_desc_size: string | null;
  };
  const [stId, setStId] = useState<string | null>(null);
  const [stTitleColor, setStTitleColor] = useState<string>("");
  const [stDescColor, setStDescColor] = useState<string>("");
  const [stTitleSize, setStTitleSize] = useState<string>("");
  const [stDescSize, setStDescSize] = useState<string>("");
  const [stLoading, setStLoading] = useState(false);
  useEffect(() => {
    document.title = 'Admin – Banners e Arquivos';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Painel Admin para gerenciar banners e arquivos.');
  }, []);
  useEffect(() => {
    const init = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }
      const {
        data: roles
      } = await supabase.from('user_roles').select('role').eq('user_id', session.user.id);
      const isAdmin = (roles || []).some((r: any) => r.role === 'admin');
      if (!isAdmin) {
        navigate('/');
        return;
      }
      setUserEmail(session.user.email || null);
      await Promise.all([loadBanners(), loadCategorias(), loadSubcategorias(), loadProdutos(), loadAllProds(), loadArquivos(), loadNumerosSerie(), loadSiteSettings(), loadSolicitacoes()]);
    };
    init();
  }, [navigate]);
  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve(res.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Banners CRUD
  const loadBanners = async () => {
    const {
      data,
      error
    } = await supabase.from('banners').select('*').order('created_at', {
      ascending: false
    });
    if (error) {
      toast({
        title: 'Erro ao carregar banners',
        description: error.message
      });
      return;
    }
    setBanners((data || []) as any);
  };
  const createBanner = async () => {
    if (!bImagemUrl.trim()) {
      toast({
        title: 'Imagem é obrigatória',
        description: 'Informe a URL da imagem do banner.'
      });
      return;
    }
    setBLoading(true);
    const payload = {
      imagem_url: bImagemUrl.trim(),
      link_redirecionamento: bLink.trim() || null,
      tamanho: bTamanho.trim() || null,
      titulo: bTitulo.trim() || null,
      descricao: bDescricao.trim() || null,
      ativo: bAtivo
    };
    const {
      error
    } = await supabase.from('banners').insert(payload as any);
    if (error) {
      toast({
        title: 'Erro ao criar',
        description: error.message
      });
    } else {
      toast({
        title: 'Banner criado'
      });
      setBImagemUrl('');
      setBLink('');
      setBTamanho('');
      setBTitulo('');
      setBDescricao('');
      setBAtivo(true);
      await loadBanners();
    }
    setBLoading(false);
  };
  const toggleAtivo = async (banner: Banner) => {
    const {
      error
    } = await supabase.from('banners').update({
      ativo: !banner.ativo
    }).eq('id', banner.id);
    if (error) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message
      });
    } else {
      setBanners(prev => prev.map(b => b.id === banner.id ? {
        ...b,
        ativo: !banner.ativo
      } : b));
    }
  };
  const deleteBanner = async (banner: Banner) => {
    if (!confirm('Excluir este banner?')) return;
    const {
      error
    } = await supabase.from('banners').delete().eq('id', banner.id);
    if (error) {
      toast({
        title: 'Erro ao excluir',
        description: error.message
      });
    } else {
      toast({
        title: 'Banner excluído'
      });
      setBanners(prev => prev.filter(b => b.id !== banner.id));
    }
  };
  const onSelectBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBLoading(true);
    const filePath = `banner-${Date.now()}-${file.name}`;
    const {
      error
    } = await supabase.storage.from('banners').upload(filePath, file, {
      contentType: file.type
    });
    if (error) {
      toast({
        title: 'Erro ao enviar imagem',
        description: error.message
      });
      setBLoading(false);
      return;
    }
    const {
      data
    } = supabase.storage.from('banners').getPublicUrl(filePath);
    setBImagemUrl(data.publicUrl);
    toast({
      title: 'Imagem enviada',
      description: 'URL preenchida automaticamente.'
    });
    setBLoading(false);
  };
  const onSelectProdutoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProdLoading(true);
    const filePath = `produto-${Date.now()}-${file.name}`;
    const {
      error
    } = await supabase.storage.from('produtos').upload(filePath, file, {
      contentType: file.type
    });
    if (error) {
      toast({
        title: 'Erro ao enviar imagem',
        description: error.message
      });
      setProdLoading(false);
      return;
    }
    const {
      data
    } = supabase.storage.from('produtos').getPublicUrl(filePath);
    setPImg(data.publicUrl);
    toast({
      title: 'Imagem enviada',
      description: 'URL preenchida automaticamente.'
    });
    setProdLoading(false);
  };
  const onSelectProdutoFileEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProdLoading(true);
    const filePath = `produto-${Date.now()}-${file.name}`;
    const {
      error
    } = await supabase.storage.from('produtos').upload(filePath, file, {
      contentType: file.type
    });
    if (error) {
      toast({
        title: 'Erro ao enviar imagem',
        description: error.message
      });
      setProdLoading(false);
      return;
    }
    const {
      data
    } = supabase.storage.from('produtos').getPublicUrl(filePath);
    setEditPImg(data.publicUrl);
    toast({
      title: 'Imagem enviada',
      description: 'URL preenchida automaticamente.'
    });
    setProdLoading(false);
  };

  // Categorias CRUD
  const loadCategorias = async () => {
    const {
      data,
      error
    } = await supabase.from('categorias').select('id, nome, descricao').order('created_at', {
      ascending: false
    });
    if (error) {
      toast({
        title: 'Erro ao carregar categorias',
        description: error.message
      });
      return;
    }
    setCategorias(data as any || []);
  };
  const loadSubcategorias = async () => {
    const {
      data,
      error
    } = await supabase.from('subcategorias').select('id, nome, descricao, categoria_id').order('created_at', {
      ascending: false
    });
    if (error) {
      toast({
        title: 'Erro ao carregar subcategorias',
        description: error.message
      });
      return;
    }
    setSubcategorias(data as any || []);
  };

  // Subcategorias CRUD
  const createSubcategoria = async () => {
    if (!subCat || !subNome.trim()) {
      toast({ title: 'Preencha os campos', description: 'Categoria e Nome são obrigatórios.' });
      return;
    }
    setSubLoading(true);
    const { error } = await supabase.from('subcategorias').insert({
      categoria_id: subCat,
      nome: subNome.trim(),
      descricao: subDesc.trim() || null,
    } as any);
    if (error) {
      toast({ title: 'Erro ao criar subcategoria', description: error.message });
    } else {
      setSubCat('');
      setSubNome('');
      setSubDesc('');
      await loadSubcategorias();
    }
    setSubLoading(false);
  };

  const startEditSubcategoria = (s: Subcategoria) => {
    setEditingSubId(s.id);
    setEditSubCat(s.categoria_id);
    setEditSubNome(s.nome);
    setEditSubDesc(s.descricao || '');
  };

  const cancelEditSubcategoria = () => {
    setEditingSubId(null);
    setEditSubCat('');
    setEditSubNome('');
    setEditSubDesc('');
  };

  const saveSubcategoria = async () => {
    if (!editingSubId) return;
    if (!editSubCat || !editSubNome.trim()) {
      toast({ title: 'Preencha os campos', description: 'Categoria e Nome são obrigatórios.' });
      return;
    }
    setSubLoading(true);
    const { error } = await supabase.from('subcategorias').update({
      categoria_id: editSubCat,
      nome: editSubNome.trim(),
      descricao: editSubDesc.trim() || null,
    }).eq('id', editingSubId);
    if (error) {
      toast({ title: 'Erro ao salvar subcategoria', description: error.message });
    } else {
      await loadSubcategorias();
      cancelEditSubcategoria();
    }
    setSubLoading(false);
  };

  const deleteSubcategoria = async (s: Subcategoria) => {
    if (!confirm('Excluir esta subcategoria?')) return;
    const { count, error: cntErr } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('subcategoria_id', s.id);
    if (cntErr) {
      toast({ title: 'Erro ao verificar vínculos', description: cntErr.message });
      return;
    }
    if ((count || 0) > 0) {
      toast({ title: 'Não é possível excluir', description: 'Existem produtos vinculados a esta subcategoria.' });
      return;
    }
    const { error } = await supabase.from('subcategorias').delete().eq('id', s.id);
    if (error) {
      toast({ title: 'Erro ao excluir subcategoria', description: error.message });
    } else {
      setSubcategorias(prev => prev.filter(x => x.id !== s.id));
    }
  };
  const createCategoria = async () => {
    if (!catNome.trim()) {
      toast({
        title: 'Nome é obrigatório'
      });
      return;
    }
    setCatLoading(true);
    const {
      error
    } = await supabase.from('categorias').insert({
      nome: catNome.trim()
    } as any);
    if (error) toast({
      title: 'Erro ao criar categoria',
      description: error.message
    });else {
      setCatNome('');
      await loadCategorias();
    }
    setCatLoading(false);
  };
  const startEditCategoria = (c: Categoria) => {
    setEditingCatId(c.id);
    setEditCatNome(c.nome);
    setEditCatDesc(c.descricao || '');
  };
  const cancelEditCategoria = () => {
    setEditingCatId(null);
    setEditCatNome('');
    setEditCatDesc('');
  };
  const saveCategoria = async () => {
    if (!editingCatId) return;
    setCatLoading(true);
    const payload = {
      nome: editCatNome.trim(),
      descricao: editCatDesc.trim() || null
    } as any;
    const {
      error
    } = await supabase.from('categorias').update(payload).eq('id', editingCatId);
    if (error) toast({
      title: 'Erro ao salvar categoria',
      description: error.message
    });else {
      await loadCategorias();
      cancelEditCategoria();
    }
    setCatLoading(false);
  };
  const deleteCategoria = async (c: Categoria) => {
    if (!confirm('Excluir esta categoria?')) return;
    // Verifica vínculos antes de excluir
    const {
      count: prodCount,
      error: prodErr
    } = await supabase.from('produtos').select('id', {
      count: 'exact',
      head: true
    }).eq('categoria_id', c.id);
    const {
      count: subCount,
      error: subErr
    } = await supabase.from('subcategorias').select('id', {
      count: 'exact',
      head: true
    }).eq('categoria_id', c.id);
    if (prodErr || subErr) {
      toast({
        title: 'Erro ao verificar vínculos',
        description: (prodErr || subErr)?.message
      });
      return;
    }
    if ((prodCount || 0) > 0 || (subCount || 0) > 0) {
      toast({
        title: 'Não é possível excluir',
        description: 'Existem produtos ou subcategorias vinculados a esta categoria.'
      });
      return;
    }
    const {
      error
    } = await supabase.from('categorias').delete().eq('id', c.id);
    if (error) toast({
      title: 'Erro ao excluir categoria',
      description: error.message
    });else setCategorias(prev => prev.filter(x => x.id !== c.id));
  };
  // Produtos CRUD
  const loadProdutos = async () => {
    if (!prodTotal && produtos.length === 0 && !prodListLoading) setProdListLoading(true);
    try {
      let query = supabase.from('produtos').select('id, partnumber, descricao, imagem_url, categoria_id, subcategoria_id', {
        count: 'exact'
      }).order('created_at', {
        ascending: false
      });
      if (fCat) {
        query = query.eq('categoria_id', fCat);
      }
      if (fSub) {
        query = query.eq('subcategoria_id', fSub);
      }
      if (fPart.trim()) {
        query = query.ilike('partnumber', `%${fPart.trim()}%`);
      }
      if (fDesc.trim()) {
        query = query.ilike('descricao', `%${fDesc.trim()}%`);
      }
      const from = (prodPage - 1) * PROD_PAGE_SIZE;
      const to = from + PROD_PAGE_SIZE - 1;
      const {
        data,
        count,
        error
      } = await query.range(from, to);
      if (error) {
        toast({
          title: 'Erro ao carregar produtos',
          description: error.message
        });
        setProdutos([]);
        setProdTotal(0);
        return;
      }
      setProdutos(data as any || []);
      setProdTotal(count || 0);
    } catch (error) {
      console.log('loadProdutos error:', error);
    } finally {
      setProdListLoading(false);
    }
  };
  const createProduto = async () => {
    if (!pPart.trim() || !pCat) {
      toast({
        title: 'Part number e categoria são obrigatórios'
      });
      return;
    }
    setProdLoading(true);
    const payload = {
      partnumber: pPart.trim(),
      descricao: pDesc.trim() || null,
      imagem_url: pImg.trim() || null,
      categoria_id: pCat,
      subcategoria_id: pSub || null
    } as any;
    const {
      error
    } = await supabase.from('produtos').insert(payload);
    if (error) toast({
      title: 'Erro ao criar produto',
      description: error.message
    });else {
      setPPart('');
      setPDesc('');
      setPImg('');
      setPCat('');
      setPSub('');
      await loadProdutos();
    }
    setProdLoading(false);
  };
  const startEditProduto = (p: Produto) => {
    setEditingProdId(p.id);
    setEditPPart(p.partnumber || '');
    setEditPDesc(p.descricao || '');
    setEditPImg(p.imagem_url || '');
    setEditPCat(p.categoria_id || '');
    setEditPSub(p.subcategoria_id || '');
  };
  const cancelEditProduto = () => {
    setEditingProdId(null);
    setEditPPart('');
    setEditPDesc('');
    setEditPImg('');
    setEditPCat('');
    setEditPSub('');
  };
  const saveProduto = async () => {
    if (!editingProdId) return;
    setProdLoading(true);
    const payload = {
      partnumber: editPPart.trim(),
      descricao: editPDesc.trim() || null,
      imagem_url: editPImg.trim() || null,
      categoria_id: editPCat,
      subcategoria_id: editPSub || null
    } as any;
    const {
      error
    } = await supabase.from('produtos').update(payload).eq('id', editingProdId);
    if (error) toast({
      title: 'Erro ao salvar produto',
      description: error.message
    });else {
      await loadProdutos();
      cancelEditProduto();
    }
    setProdLoading(false);
  };
  const deleteProduto = async (p: Produto) => {
    if (!confirm('Excluir este produto?')) return;
    const {
      error
    } = await supabase.from('produtos').delete().eq('id', p.id);
    if (error) toast({
      title: 'Erro ao excluir produto',
      description: error.message
    });else setProdutos(prev => prev.filter(x => x.id !== p.id));
  };
  useEffect(() => {
    loadProdutos();
  }, [fPart, fDesc, fCat, fSub, prodPage]);

  // Atualiza contagem de arquivos por produto (na página atual)
  useEffect(() => {
    const ids = produtos.map(p => p.id);
    if (ids.length === 0) { setProdFileCounts({}); return; }
    (async () => {
      const { data, error } = await supabase
        .from('arquivos')
        .select('id, produto_id')
        .in('produto_id', ids);
      if (!error) {
        const counts: Record<string, number> = {};
        (data as any[]).forEach((row: any) => {
          counts[row.produto_id] = (counts[row.produto_id] || 0) + 1;
        });
        setProdFileCounts(counts);
      }
    })();
  }, [produtos]);

  const loadFilesForProduct = async (prodId: string) => {
    if (prodFilesMap[prodId]) return;
    const { data } = await supabase
      .from('arquivos')
      .select('id, nome_arquivo, categoria_arquivo, link_url, downloads, listado')
      .eq('produto_id', prodId)
      .order('created_at', { ascending: false });
    setProdFilesMap(prev => ({ ...prev, [prodId]: (data as any) || [] }));
  };

  // Produtos (lista para seleção em Arquivos)
  const loadAllProds = async () => {
    const {
      data,
      error
    } = await supabase.from('produtos').select('id, partnumber').order('partnumber', {
      ascending: true
    }).limit(1000);
    if (error) {
      toast({
        title: 'Erro ao carregar produtos (seleção)',
        description: error.message
      });
      return;
    }
    setAllProds(data as any || []);
  };

  // Arquivos (listagem)
  const loadArquivos = async () => {
    setArqListLoading(true);
    const {
      data,
      error
    } = await supabase.from('arquivos').select('id, produto_id, nome_arquivo, descricao, categoria_arquivo, link_url, downloads, created_at, listado').order('created_at', {
      ascending: false
    }).limit(30);
    if (error) {
      toast({
        title: 'Erro ao carregar arquivos',
        description: error.message
      });
      setArquivos([]);
    } else {
      setArquivos(data as any || []);
    }
    setArqListLoading(false);
  };

  // Números de Série (listagem)
  const loadNumerosSerie = async () => {
    setNsListLoading(true);
    const {
      data,
      error
    } = await supabase.from('numeros_serie').select('id, produto_id, numero_serie, created_at').order('created_at', {
      ascending: false
    }).limit(50);
    if (error) {
      toast({
        title: 'Erro ao carregar números de série',
        description: error.message
      });
      setNumerosSerie([]);
    } else {
      setNumerosSerie(data as any || []);
    }
    setNsListLoading(false);
  };

  // Solicitações (listagem e ações)
  const loadSolicitacoes = async () => {
    setSolLoading(true);
    const {
      data,
      error
    } = await supabase.from('solicitacoes_firmware').select('id, created_at, numero_serie, produto_nome, descricao, status, nome, telefone, email').neq('status', 'finalizado').order('created_at', {
      ascending: false
    });
    if (error) {
      toast({
        title: 'Erro ao carregar solicitações',
        description: error.message
      });
      setSolicitacoes([]);
    } else {
      setSolicitacoes(data as any || []);
    }
    setSolLoading(false);
  };
  const updateSolicitacaoStatus = async (id: string, status: string) => {
    const {
      error
    } = await supabase.from('solicitacoes_firmware').update({
      status
    }).eq('id', id);
    if (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message
      });
    } else {
      setSolicitacoes(prev => prev.map(s => s.id === id ? {
        ...s,
        status
      } : s).filter(s => s.status !== 'finalizado'));
    }
  };
  const finalizeSolicitacao = async (id: string) => {
    await updateSolicitacaoStatus(id, 'finalizado');
  };

  // Números de Série (create)
  const createNumeroSerie = async () => {
    if (!nsProduto || !nsNumero.trim()) {
      toast({
        title: 'Preencha os campos',
        description: 'Produto e Número de Série são obrigatórios.'
      });
      return;
    }
    setNsLoading(true);
    const payload = {
      produto_id: nsProduto,
      numero_serie: nsNumero.trim()
    } as any;
    const {
      error
    } = await supabase.from('numeros_serie').insert(payload);
    if (error) {
      toast({
        title: 'Erro ao cadastrar número',
        description: error.message
      });
    } else {
      toast({
        title: 'Número de série cadastrado'
      });
      setNsProduto('');
      setNsNumero('');
      await loadNumerosSerie();
    }
    setNsLoading(false);
  };

  // Site Settings (carregar)
  const loadSiteSettings = async () => {
    try {
      setStLoading(true);
      const {
        data,
        error
      } = await supabase.from('site_settings').select('id,banner_title_color,banner_desc_color,banner_title_size,banner_desc_size').limit(1);
      if (error) {
        toast({
          title: 'Erro ao carregar configurações',
          description: error.message
        });
        return;
      }
      const s = (data && data[0]) as SiteSettings | undefined;
      if (s) {
        setStId(s.id);
        setStTitleColor(s.banner_title_color || '');
        setStDescColor(s.banner_desc_color || '');
        setStTitleSize(s.banner_title_size || '');
        setStDescSize(s.banner_desc_size || '');
        // Aplica imediatamente no tema para pré-visualização
        const root = document.documentElement;
        if (s.banner_title_color) root.style.setProperty('--banner-title-color', s.banner_title_color);
        if (s.banner_desc_color) root.style.setProperty('--banner-desc-color', s.banner_desc_color);
        if (s.banner_title_size) root.style.setProperty('--banner-title-size', s.banner_title_size);
        if (s.banner_desc_size) root.style.setProperty('--banner-desc-size', s.banner_desc_size);
      }
    } finally {
      setStLoading(false);
    }
  };

  // Arquivos - edição e exclusão
  const startEditArquivo = (a: Arquivo) => {
    setEditingArqId(a.id);
    setEditAProd(a.produto_id);
    setEditANome(a.nome_arquivo);
    setEditATipo(a.categoria_arquivo);
    setEditALink(a.link_url);
    setEditADesc(a.descricao || '');
  };
  const cancelEditArquivo = () => {
    setEditingArqId(null);
    setEditAProd('');
    setEditANome('');
    setEditATipo('');
    setEditALink('');
    setEditADesc('');
  };
  const saveArquivo = async () => {
    if (!editingArqId) return;
    if (!editAProd || !editATipo || !editANome.trim() || !editALink.trim()) {
      toast({
        title: 'Preencha os campos obrigatórios',
        description: 'Produto, Tipo, Nome e Link são obrigatórios.'
      });
      return;
    }
    setArqLoading(true);
    const payload = {
      produto_id: editAProd,
      categoria_arquivo: editATipo,
      nome_arquivo: editANome.trim(),
      descricao: editADesc.trim() || null,
      link_url: editALink.trim()
    } as any;
    const {
      error
    } = await supabase.from('arquivos').update(payload).eq('id', editingArqId);
    if (error) {
      toast({
        title: 'Erro ao salvar arquivo',
        description: error.message
      });
    } else {
      toast({
        title: 'Arquivo atualizado'
      });
      await loadArquivos();
      cancelEditArquivo();
    }
    setArqLoading(false);
  };
  const deleteArquivo = async (a: Arquivo) => {
    if (!confirm('Excluir este arquivo?')) return;
    const {
      error
    } = await supabase.from('arquivos').delete().eq('id', a.id);
    if (error) toast({
      title: 'Erro ao excluir arquivo',
      description: error.message
    });else {
      toast({
        title: 'Arquivo excluído'
      });
      setArquivos(prev => prev.filter(x => x.id !== a.id));
    }
  };
  const toggleArquivoListado = async (a: Arquivo) => {
    const {
      error
    } = await supabase.from('arquivos').update({
      listado: !a.listado
    }).eq('id', a.id);
    if (error) {
      toast({
        title: 'Erro ao atualizar listagem',
        description: error.message
      });
    } else {
      setArquivos(prev => prev.map(x => x.id === a.id ? {
        ...x,
        listado: !a.listado
      } : x));
    }
  };

  // Arquivos CRUD (create)
  const createArquivo = async () => {
    if (!aProd || !aTipo || !aNome.trim() || !aLink.trim()) {
      toast({
        title: 'Preencha os campos obrigatórios',
        description: 'Produto, Tipo, Nome e Link são obrigatórios.'
      });
      return;
    }
    setALoading(true);
    const payload = {
      produto_id: aProd,
      categoria_arquivo: aTipo,
      nome_arquivo: aNome.trim(),
      descricao: aDesc.trim() || null,
      link_url: aLink.trim(),
      listado: !aNaoListado
    } as any;
    const {
      error
    } = await supabase.from('arquivos').insert(payload);
    if (error) {
      toast({
        title: 'Erro ao cadastrar arquivo',
        description: error.message
      });
    } else {
      toast({
        title: 'Arquivo cadastrado'
      });
      setAProd('');
      setATipo('');
      setANome('');
      setADesc('');
      setALink('');
      setANaoListado(false);
      await loadArquivos();
    }
    setALoading(false);
  };
  const cleanupAuthState = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) localStorage.removeItem(key);
      });
      if (typeof sessionStorage !== 'undefined') {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) sessionStorage.removeItem(key);
        });
      }
    } catch {}
  };
  const handleSignOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({
          scope: 'global'
        } as any);
      } catch {}
      window.location.href = '/auth';
    } catch {}
  };

  // Dashboard helpers and loaders
  const getDayRange = (dateStr: string) => {
    const start = new Date(dateStr + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };
  const getMonthRange = (ym: string) => {
    const start = new Date(ym + '-01T00:00:00');
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  };
  const loadDailyCount = async () => {
    const {
      start,
      end
    } = getDayRange(dailyDate);
    const {
      count,
      error
    } = await supabase.from('download_logs').select('id', {
      count: 'exact',
      head: true
    }).gte('created_at', start).lt('created_at', end);
    if (!error) setDailyCount(count || 0);
  };
  const loadMonthlyCount = async () => {
    const {
      start,
      end
    } = getMonthRange(monthSel);
    const {
      count,
      error
    } = await supabase.from('download_logs').select('id', {
      count: 'exact',
      head: true
    }).gte('created_at', start).lt('created_at', end);
    if (!error) setMonthlyCount(count || 0);
  };
  const getDaysOfMonth = (ym: string) => {
    const [yearStr, monthStr] = ym.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12
    const first = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const days = Array.from({
      length: daysInMonth
    }, (_, i) => {
      const d = new Date(year, month - 1, i + 1);
      return {
        key: `${year}-${pad(month)}-${pad(i + 1)}`,
        label: `${pad(i + 1)}/${pad(month)}`
      };
    });
    return {
      start: first.toISOString(),
      end: nextMonth.toISOString(),
      days
    };
  };
  const loadDailySeries = async (ym = monthSel) => {
    setSeriesLoading(true);
    try {
      const {
        start,
        end,
        days
      } = getDaysOfMonth(ym);
      const {
        data,
        error
      } = await supabase.from('download_logs').select('created_at').gte('created_at', start).lt('created_at', end).limit(20000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      if (error) {
        toast({
          title: 'Erro ao carregar série de downloads',
          description: error.message
        });
        setDailySeries(days.map(d => ({
          date: d.key,
          dateLabel: d.label,
          count: 0
        })));
        return;
      }
      const counts: Record<string, number> = {};
      (data as any[]).forEach(row => {
        const d = new Date(row.created_at as string);
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      setDailySeries(days.map(d => ({
        date: d.key,
        dateLabel: d.label,
        count: counts[d.key] || 0
      })));
    } finally {
      setSeriesLoading(false);
    }
  };
  useEffect(() => {
    loadDailyCount();
  }, [dailyDate]);
  useEffect(() => {
    loadMonthlyCount();
  }, [monthSel]);
  useEffect(() => {
    loadDailySeries(monthSel);
  }, [monthSel]);
  const pendingCount = solicitacoes.filter(s => s.status === 'pendente').length;
  return <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Painel de Gestão do Portal</h1>
          <p className="text-muted-foreground">Em breve: gerenciamento de Banners, Categorias, Produtos, Arquivos e Solicitações.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={pendingCount > 0 ? `Notificações pendentes: ${pendingCount}` : 'Sem notificações pendentes'} className={`relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-transparent transition-colors ${pendingCount > 0 ? 'text-destructive' : 'text-success'}`}>
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 px-1 py-0 text-[10px] leading-none">{pendingCount}</Badge>}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground" title={userEmail || ''}>{userEmail || '—'}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sair</Button>
          </div>
        </div>
      </div>

      {/* Dashboard downloads */}
      <section aria-label="Dashboard downloads" className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
        <Card>
          <CardHeader className="items-center text-center gap-1 px-3 py-2">
            <CardTitle className="text-base font-medium tracking-tight min-w-0 truncate">Downloads do dia</CardTitle>
            <div className="shrink-0 w-[141px] sm:w-[158px]">
              <Label htmlFor="daily-date" className="sr-only">Dia</Label>
              <Input id="daily-date" type="date" aria-label="Selecionar dia" value={dailyDate} onChange={e => setDailyDate(e.target.value)} className="h-8 text-sm" />
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-3xl sm:text-4xl font-semibold">{dailyCount}</div>
            <p className="text-sm text-muted-foreground">Total no dia selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center gap-1 px-3 py-2">
            <CardTitle className="text-base font-medium tracking-tight min-w-0 truncate">Downloads do mês</CardTitle>
            <div className="shrink-0 w-[141px] sm:w-[158px]">
              <Label htmlFor="month-sel" className="sr-only">Mês</Label>
              <Input id="month-sel" type="month" aria-label="Selecionar mês" value={monthSel} onChange={e => setMonthSel(e.target.value)} className="h-8 text-sm" />
            </div>
          </CardHeader>
          <CardContent className="py-3">
            <div className="text-3xl sm:text-4xl font-semibold">{monthlyCount}</div>
            <p className="text-sm text-muted-foreground">Total no mês selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="items-center text-center gap-1 px-3 py-2">
            <CardTitle className="text-base font-medium tracking-tight min-w-0 truncate">Evolução diária do mês</CardTitle>
            <div className="shrink-0 w-[141px] sm:w-[176px]">
              <Label htmlFor="month-sel-graph" className="sr-only">Mês</Label>
              <Input id="month-sel-graph" type="month" aria-label="Selecionar mês para gráfico" value={monthSel} onChange={e => setMonthSel(e.target.value)} className="h-8 text-sm" />
            </div>
          </CardHeader>
          <CardContent className="px-3 pt-2 overflow-hidden">
            {dailySeries.length > 0 ? <ChartContainer config={{
            count: {
              label: 'Downloads',
              color: 'hsl(var(--primary))'
            }
          }} className="h-40 sm:h-44 w-full">
                <LineChart data={dailySeries} margin={{
              left: 8,
              right: 8
            }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer> : <p className="text-sm text-muted-foreground">Sem dados no período.</p>}
          </CardContent>
        </Card>
      </section>

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
                <Input id="bimg" placeholder="https://..." value={bImagemUrl} onChange={e => setBImagemUrl(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="blink">Link de redirecionamento (opcional)</Label>
                <Input id="blink" placeholder="https://..." value={bLink} onChange={e => setBLink(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="btam">Tamanho (ex: 1200x400)</Label>
                <Input id="btam" placeholder="ex: 1200x400" value={bTamanho} onChange={e => setBTamanho(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="btitulo">Título (opcional)</Label>
                <Input id="btitulo" placeholder="Título do banner" value={bTitulo} onChange={e => setBTitulo(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="bdesc">Descrição (opcional)</Label>
                <Input id="bdesc" placeholder="Texto adicional" value={bDescricao} onChange={e => setBDescricao(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bfile">Upload imagem</Label>
                <Input id="bfile" type="file" accept="image/*" onChange={onSelectBannerFile} />
              </div>
              {bImagemUrl && <div className="md:col-span-5">
                  <Label>Pré-visualização</Label>
                  <img src={bImagemUrl} alt="Pré-visualização do banner" className="w-full h-32 object-cover rounded" loading="lazy" />
                </div>}
              <div className="flex items-center gap-2">
                <Switch id="bativo" checked={bAtivo} onCheckedChange={setBAtivo} />
                <Label htmlFor="bativo">Ativo</Label>
              </div>
              <div className="md:col-span-5">
                <Button onClick={createBanner} disabled={bLoading}>Criar banner</Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {banners.map(b => <Card key={b.id} className="hover:shadow-md transition">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{b.tamanho || 'Banner'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4 pt-0">
                    <img src={b.imagem_url} alt={`Banner ${b.tamanho || 'padrão'}`} className="w-full h-32 object-cover rounded" loading="lazy" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={b.ativo} onCheckedChange={() => toggleAtivo(b)} id={`ativo-${b.id}`} />
                        <Label htmlFor={`ativo-${b.id}`} className="text-sm">Ativo</Label>
                      </div>
                      <div className="flex gap-2">
                        {b.link_redirecionamento && <Button asChild variant="secondary" size="sm">
                            <a href={b.link_redirecionamento} target="_blank" rel="noopener noreferrer">Abrir</a>
                          </Button>}
                        <Button variant="destructive" size="sm" onClick={() => deleteBanner(b)}>Excluir</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
              {banners.length === 0 && <p className="text-sm text-muted-foreground">Nenhum banner cadastrado.</p>}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Categorias */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="catnome">Nome</Label>
                <Input id="catnome" value={catNome} onChange={e => setCatNome(e.target.value)} placeholder="Nome da categoria" />
              </div>
              <div className="md:col-span-3">
                <Button onClick={createCategoria} disabled={catLoading}>Criar categoria</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[220px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map(c => <TableRow key={c.id}>
                      <TableCell>
                        {editingCatId === c.id ? <Input value={editCatNome} onChange={e => setEditCatNome(e.target.value)} placeholder="Nome" /> : <span className="font-medium">{c.nome}</span>}
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        {editingCatId === c.id ? <Input value={editCatDesc} onChange={e => setEditCatDesc(e.target.value)} placeholder="Descrição (opcional)" /> : <p className="text-sm text-muted-foreground line-clamp-2">{c.descricao}</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {editingCatId === c.id ? <>
                              <Button size="sm" onClick={saveCategoria} disabled={catLoading}>Salvar</Button>
                              <Button size="sm" variant="outline" onClick={cancelEditCategoria}>Cancelar</Button>
                            </> : <>
                              <Button size="sm" variant="secondary" onClick={() => startEditCategoria(c)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteCategoria(c)}>Excluir</Button>
                            </>}
                        </div>
                      </TableCell>
                    </TableRow>)}
                  {categorias.length === 0 && <TableRow>
                      <TableCell colSpan={3} className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</TableCell>
                    </TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Subcategorias */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Subcategorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={subCat} onValueChange={setSubCat}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subnome">Nome</Label>
                <Input id="subnome" value={subNome} onChange={e => setSubNome(e.target.value)} placeholder="Nome da subcategoria" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="subdesc">Descrição (opcional)</Label>
                <Input id="subdesc" value={subDesc} onChange={e => setSubDesc(e.target.value)} placeholder="Descrição da subcategoria" />
              </div>
              <div className="md:col-span-4">
                <Button onClick={createSubcategoria} disabled={subLoading || !subCat || !subNome.trim()}>Criar subcategoria</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategorias.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {editingSubId === s.id ? (
                          <Input value={editSubNome} onChange={e => setEditSubNome(e.target.value)} placeholder="Nome" />
                        ) : (
                          <span className="font-medium">{s.nome}</span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        {editingSubId === s.id ? (
                          <Input value={editSubDesc} onChange={e => setEditSubDesc(e.target.value)} placeholder="Descrição (opcional)" />
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">{s.descricao}</p>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        {editingSubId === s.id ? (
                          <Select value={editSubCat} onValueChange={setEditSubCat}>
                            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                            <SelectContent>
                              {categorias.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          categorias.find(c => c.id === s.categoria_id)?.nome || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {editingSubId === s.id ? (
                            <>
                              <Button size="sm" onClick={saveSubcategoria} disabled={subLoading || !editSubCat || !editSubNome.trim()}>Salvar</Button>
                              <Button size="sm" variant="outline" onClick={cancelEditSubcategoria}>Cancelar</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="secondary" onClick={() => startEditSubcategoria(s)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteSubcategoria(s)}>Excluir</Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subcategorias.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-sm text-muted-foreground">Nenhuma subcategoria cadastrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Produtos */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-5 gap-3">
              <div>
                <Label htmlFor="ppart">Part number</Label>
                <Input id="ppart" value={pPart} onChange={e => setPPart(e.target.value)} placeholder="Ex: ABC-123" />
              </div>
              <div>
                <Label htmlFor="pdesc">Descrição</Label>
                <Textarea id="pdesc" rows={1} className="h-10 resize-none" value={pDesc} onChange={e => setPDesc(e.target.value)} placeholder="Descrição do produto" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="pimg">Imagem URL</Label>
                <Input id="pimg" value={pImg} onChange={e => setPImg(e.target.value)} placeholder="https://... (opcional)" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="pfile">Upload imagem</Label>
                <Input id="pfile" type="file" accept="image/*" onChange={onSelectProdutoFile} />
              </div>
              {pImg && <div className="md:col-span-5">
                  <Label>Pré-visualização</Label>
                  <img src={pImg} alt="Pré-visualização do produto" className="w-full h-16 object-cover rounded" loading="lazy" />
                </div>}
              <div>
                <Label>Categoria</Label>
                <Select value={pCat} onValueChange={v => {
                setPCat(v);
                setPSub('');
              }}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategoria</Label>
                <Select value={pSub} onValueChange={setPSub} disabled={!pCat}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {subcategorias.filter(s => s.categoria_id === pCat).map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-5">
                <Button onClick={createProduto} disabled={prodLoading || !pPart.trim() || !pCat}>Criar produto</Button>
              </div>
            </div>
            <div className="rounded-md border bg-muted/40 p-3 shadow-sm">
              <div className="grid md:grid-cols-5 gap-2">
                <div>
                  <Label htmlFor="fpart" className="text-sm">Modelo</Label>
                  <Input id="fpart" value={fPart} onChange={e => { setFPart(e.target.value); setProdPage(1); }} placeholder="Ex: ABC-123" className="h-8 text-sm" />
                </div>
                <div>
                  <Label htmlFor="fdesc" className="text-sm">Descrição</Label>
                  <Input id="fdesc" value={fDesc} onChange={e => { setFDesc(e.target.value); setProdPage(1); }} placeholder="Texto na descrição" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-sm">Categoria</Label>
                  <Select value={fCat || 'all'} onValueChange={v => { setFCat(v === 'all' ? '' : v); setFSub(''); setProdPage(1); }}>
                    <SelectTrigger className="h-8"><SelectValue placeholder="Todas" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Subcategoria</Label>
                  <Select value={fSub || 'all'} onValueChange={v => { setFSub(v === 'all' ? '' : v); setProdPage(1); }} disabled={!fCat}>
                    <SelectTrigger className="h-8"><SelectValue placeholder={!fCat ? 'Selecione a categoria' : 'Todas'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {subcategorias.filter(s => s.categoria_id === fCat).map(s => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setFPart(''); setFDesc(''); setFCat(''); setFSub(''); setProdPage(1); }}>Limpar</Button>
                </div>
              </div>
            </div>

            {prodListLoading && <p className="text-sm text-muted-foreground">Carregando produtos...</p>}
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagem</TableHead>
                    <TableHead>Part number</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Subcategoria</TableHead>
                    <TableHead className="text-center">Arquivos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map(p => {
                  const isEditing = editingProdId === p.id;
                  return <TableRow key={p.id}>
                        <TableCell className="align-top">
                          {isEditing ? <div className="space-y-2 max-w-[220px]">
                              <Input value={editPImg} onChange={e => setEditPImg(e.target.value)} placeholder="Imagem URL" />
                              <Input id="epfile" type="file" accept="image/*" onChange={onSelectProdutoFileEdit} />
                              {editPImg && <img src={editPImg} alt={`Pré-visualização ${editPPart || 'produto'}`} className="w-14 h-10 object-cover rounded" loading="lazy" />}
                            </div> : p.imagem_url ? <img src={p.imagem_url} alt={`Imagem ${p.partnumber}`} className="w-14 h-10 object-cover rounded" loading="lazy" /> : null}
                        </TableCell>
                        <TableCell className="align-top">
                          {isEditing ? <Input value={editPPart} onChange={e => setEditPPart(e.target.value)} placeholder="Part number" /> : <span className="font-medium">{p.partnumber}</span>}
                        </TableCell>
                        <TableCell className="align-top min-w-[240px]">
                          {isEditing ? <Textarea rows={1} className="h-10 resize-none" value={editPDesc} onChange={e => setEditPDesc(e.target.value)} placeholder="Descrição" /> : <p className="text-sm text-muted-foreground line-clamp-3">{p.descricao}</p>}
                        </TableCell>
                        <TableCell className="align-top min-w-[180px]">
                          {isEditing ? (
                            <Select value={editPCat} onValueChange={(v) => { setEditPCat(v); setEditPSub(''); }}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {categorias.map(c => (
                                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            categorias.find(c => c.id === p.categoria_id)?.nome || '-'
                          )}
                        </TableCell>

                        <TableCell className="align-top min-w-[180px]">
                          {isEditing ? (
                            <Select value={editPSub} onValueChange={setEditPSub} disabled={!editPCat}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {subcategorias
                                  .filter(s => s.categoria_id === editPCat)
                                  .map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            subcategorias.find(s => s.id === p.subcategoria_id)?.nome || '-'
                          )}
                        </TableCell>

                        {/* Arquivos vinculados */}
                        <TableCell className="text-center align-top">
                          <Popover onOpenChange={(open) => { if (open) loadFilesForProduct(p.id); }}>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="font-medium">
                                {prodFileCounts[p.id] || 0}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72" align="center">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium">Arquivos vinculados</h4>
                                <div className="max-h-60 overflow-y-auto">
                                  {(prodFilesMap[p.id] || []).length > 0 ? (
                                    <ul className="space-y-1">
                                      {(prodFilesMap[p.id] || []).map((f) => (
                                        <li key={f.id} className="text-sm flex items-center justify-between">
                                          <span className="truncate pr-2">{f.nome_arquivo}</span>
                                          <a href={f.link_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">Abrir</a>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">{prodFilesMap[p.id] ? 'Nenhum arquivo.' : 'Carregando...'}</p>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        <TableCell className="text-right align-top space-x-2 min-w-[200px]">
                          {isEditing ? <>
                              <Button size="sm" onClick={saveProduto} disabled={prodLoading || !editPPart.trim() || !editPCat}>Salvar</Button>
                              <Button size="sm" variant="outline" onClick={cancelEditProduto}>Cancelar</Button>
                            </> : <>
                              <Button size="sm" variant="secondary" onClick={() => startEditProduto(p)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => deleteProduto(p)}>Excluir</Button>
                            </>}
                        </TableCell>
                      </TableRow>;
                })}
                </TableBody>
              </Table>
              {produtos.length === 0 && !prodListLoading && <p className="text-sm text-muted-foreground mt-2">Nenhum produto cadastrado.</p>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Página {prodPage} de {Math.max(1, Math.ceil(prodTotal / PROD_PAGE_SIZE))}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setProdPage(p => Math.max(1, p - 1))} disabled={prodPage <= 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setProdPage(p => p + 1)} disabled={prodPage >= Math.max(1, Math.ceil(prodTotal / PROD_PAGE_SIZE))}>Próxima</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Números de Série */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Números de Série</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label>Produto</Label>
                <Select value={nsProduto} onValueChange={setNsProduto}>
                  <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                  <SelectContent>
                    {allProds.map(p => <SelectItem key={p.id} value={p.id}>{p.partnumber}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nsnumero">Número de série</Label>
                <Input id="nsnumero" value={nsNumero} onChange={e => setNsNumero(e.target.value)} placeholder="Máx. 9 dígitos" maxLength={9} />
              </div>
              <div className="md:col-span-4">
                <Button onClick={createNumeroSerie} disabled={nsLoading || !nsProduto || !nsNumero.trim()}>Cadastrar número de série</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-medium">Últimos cadastrados</h3>
              {nsListLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : numerosSerie.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum número cadastrado.</p> : <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {numerosSerie.map(ns => {
                    const prod = allProds.find(p => p.id === ns.produto_id);
                    return <TableRow key={ns.id}>
                            <TableCell className="font-medium">{ns.numero_serie}</TableCell>
                            <TableCell>{prod?.partnumber || ns.produto_id}</TableCell>
                            <TableCell>{new Date(ns.created_at).toLocaleString()}</TableCell>
                          </TableRow>;
                  })}
                    </TableBody>
                  </Table>
                </div>}
            </div>
          </CardContent>
        </Card>
      </section>


       {/* Arquivos */}
       <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Arquivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <Label>Produto</Label>
                <Select value={aProd} onValueChange={setAProd}>
                  <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                  <SelectContent>
                    {allProds.map(p => <SelectItem key={p.id} value={p.id}>{p.partnumber}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="anome">Nome do arquivo</Label>
                <Input id="anome" value={aNome} onChange={e => setANome(e.target.value)} placeholder="Ex: Manual v1.0" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="adesc">Descrição (opcional)</Label>
                <Textarea id="adesc" value={aDesc} onChange={e => setADesc(e.target.value)} placeholder="Breve descrição do arquivo" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={aTipo} onValueChange={setATipo}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firmware">Firmware</SelectItem>
                    <SelectItem value="documento">Documento</SelectItem><SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="alink">Link URL</Label>
                <Input id="alink" value={aLink} onChange={e => setALink(e.target.value)} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <Switch id="anaolistado" checked={aNaoListado} onCheckedChange={setANaoListado} />
                <Label htmlFor="anaolistado">Não listado</Label>
              </div>
              <div className="md:col-span-4">
                <Button onClick={createArquivo} disabled={aLoading || !aProd || !aTipo || !aNome.trim() || !aLink.trim()}>Cadastrar arquivo</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-medium">Arquivos adicionados</h3>
              {arqListLoading ? <p className="text-sm text-muted-foreground">Carregando arquivos...</p> : arquivos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum arquivo cadastrado.</p> : <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="text-center">Não listado</TableHead>
                        <TableHead className="text-right">Downloads</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {arquivos.map(a => {
                    const prod = allProds.find(p => p.id === a.produto_id);
                    const isEditing = editingArqId === a.id;
                    return <TableRow key={a.id}>
                            <TableCell className="font-medium">
                              {isEditing ? <Input value={editANome} onChange={e => setEditANome(e.target.value)} /> : a.nome_arquivo}
                            </TableCell>
                            <TableCell className="min-w-[200px]">
                              {isEditing ? <Input value={editADesc} onChange={e => setEditADesc(e.target.value)} placeholder="Descrição (opcional)" /> : <p className="text-sm text-muted-foreground line-clamp-2">{a.descricao}</p>}
                            </TableCell>
                            <TableCell className="capitalize">
                              {isEditing ? <Select value={editATipo} onValueChange={setEditATipo}>
                                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="firmware">Firmware</SelectItem>
                                    <SelectItem value="documento">Documento</SelectItem>
                                    <SelectItem value="video">Vídeo</SelectItem>
                                  </SelectContent>
                                </Select> : a.categoria_arquivo}
                            </TableCell>
                            <TableCell>
                              {isEditing ? <Select value={editAProd} onValueChange={setEditAProd}>
                                  <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
                                  <SelectContent>
                                    {allProds.map(p => <SelectItem key={p.id} value={p.id}>{p.partnumber}</SelectItem>)}
                                  </SelectContent>
                                </Select> : prod?.partnumber || a.produto_id}
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              {isEditing ? <Input value={editALink} onChange={e => setEditALink(e.target.value)} placeholder="https://..." /> : <Button size="icon" variant="outline" aria-label="Copiar link" onClick={() => {
                          navigator.clipboard.writeText(a.link_url);
                          toast({
                            title: 'Link copiado'
                          });
                        }}>
                                  <Copy className="h-4 w-4" />
                                </Button>}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch checked={!a.listado} onCheckedChange={() => toggleArquivoListado(a)} aria-label="Marcar como não listado" />
                            </TableCell>
                            <TableCell className="text-right">{a.downloads}</TableCell>
                            <TableCell className="text-right space-x-2">
                              {isEditing ? <>
                                  <Button size="sm" onClick={saveArquivo} disabled={arqLoading || !editANome.trim() || !editALink.trim() || !editATipo || !editAProd}>Salvar</Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditArquivo}>Cancelar</Button>
                                </> : <>
                                  <Button asChild size="sm" variant="secondary">
                                    <a href={a.link_url} target="_blank" rel="noopener noreferrer">Abrir</a>
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => startEditArquivo(a)}>Editar</Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteArquivo(a)}>Excluir</Button>
                                </>}
                            </TableCell>
                          </TableRow>;
                  })}
                    </TableBody>
                  </Table>
                </div>}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Solicitações (Não encontrei) */}
      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Solicitações (Não encontrei)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {solLoading ? <p className="text-sm text-muted-foreground">Carregando solicitações...</p> : solicitacoes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p> : <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Nº de Série</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoes.map(s => <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.nome || '-'}</TableCell>
                        <TableCell>{s.telefone || '-'}</TableCell>
                        <TableCell>{s.email || '-'}</TableCell>
                        <TableCell className="min-w-[160px]">{s.produto_nome || '-'}</TableCell>
                        <TableCell>{s.numero_serie || '-'}</TableCell>
                        <TableCell className="min-w-[220px]"><p className="text-sm text-muted-foreground line-clamp-2" title={s.descricao || ''}>{s.descricao || '-'}</p></TableCell>
                        <TableCell className="min-w-[160px]">
                          <Select value={s.status} onValueChange={v => updateSolicitacaoStatus(s.id, v)}>
                            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_andamento">Em andamento</SelectItem>
                              <SelectItem value="finalizado">Finalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="secondary" onClick={() => finalizeSolicitacao(s.id)}>Finalizar</Button>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>}
          </CardContent>
        </Card>
      </section>

    </main>;
};
export default Admin;