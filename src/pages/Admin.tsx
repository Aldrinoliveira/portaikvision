import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { FileUploadButton } from "@/components/FileUploadButton";

interface Produto {
  id: string;
  created_at: string;
  partnumber: string;
  descricao: string;
  categoria_id: string;
  subcategoria_id: string;
  listado: boolean;
  imagens: string[];
  datasheet: string;
  video_url: string;
}

interface Categoria {
  id: string;
  created_at: string;
  nome: string;
  descricao: string;
}

interface Subcategoria {
  id: string;
  created_at: string;
  nome: string;
  categoria_id: string;
}

interface Arquivo {
  id: string;
  created_at: string;
  produto_id: string;
  nome_arquivo: string;
  categoria_arquivo: string;
  link_url: string;
  descricao: string;
  listado: boolean;
}

interface Banner {
  id: string;
  created_at: string;
  image_url: string;
  link_url: string;
  alt_text: string;
  listado: boolean;
}

interface Solicitacao {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  mensagem: string;
  produto_interesse: string;
  status: 'pendente' | 'resolvido';
}

const Admin = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  const [novoProduto, setNovoProduto] = useState({
    partnumber: '',
    descricao: '',
    categoria_id: '',
    subcategoria_id: '',
    listado: false,
    imagens: [] as string[],
    datasheet: '',
    video_url: '',
  });

  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    descricao: '',
  });

  const [novaSubcategoria, setNovaSubcategoria] = useState({
    nome: '',
    categoria_id: '',
  });

  const [novoArquivo, setNovoArquivo] = useState({
    produto_id: '',
    nome_arquivo: '',
    categoria_arquivo: '',
    link_url: '',
    descricao: '',
    listado: false,
  });

  const [novoBanner, setNovoBanner] = useState({
    image_url: '',
    link_url: '',
    alt_text: '',
    listado: false,
  });

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
    fetchSubcategorias();
    fetchArquivos();
    fetchBanners();
    fetchSolicitacoes();
  }, []);

  const fetchProdutos = async () => {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) {
      toast({
        title: "Erro ao buscar produtos",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) setProdutos(data);
  };

  const fetchCategorias = async () => {
    const { data, error } = await supabase.from('categorias').select('*');
    if (error) {
      toast({
        title: "Erro ao buscar categorias",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) setCategorias(data);
  };

  const fetchSubcategorias = async () => {
    const { data, error } = await supabase.from('subcategorias').select('*');
    if (error) {
      toast({
        title: "Erro ao buscar subcategorias",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) setSubcategorias(data);
  };

  const fetchArquivos = async () => {
    const { data, error } = await supabase.from('arquivos').select('*');
    if (error) {
      toast({
        title: "Erro ao buscar arquivos",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) setArquivos(data);
  };

  const fetchBanners = async () => {
    const { data, error } = await supabase.from('banners').select('*');
    if (error) {
      toast({
        title: "Erro ao buscar banners",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) setBanners(data);
  };

  const fetchSolicitacoes = async () => {
    const { data, error } = await supabase.from('solicitacoes').select('*');
    if (error) {
      toast({
        title: "Erro ao buscar solicitações",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) setSolicitacoes(data);
  };

  const handleProdutoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('produtos').insert([novoProduto]);
    if (error) {
      toast({
        title: "Erro ao cadastrar produto",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      toast({
        title: "Produto cadastrado com sucesso!",
      });
      fetchProdutos();
      setNovoProduto({
        partnumber: '',
        descricao: '',
        categoria_id: '',
        subcategoria_id: '',
        listado: false,
        imagens: [] as string[],
        datasheet: '',
        video_url: '',
      });
    }
  };

  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('categorias').insert([novaCategoria]);
    if (error) {
      toast({
        title: "Erro ao cadastrar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      toast({
        title: "Categoria cadastrada com sucesso!",
      });
      fetchCategorias();
      setNovaCategoria({
        nome: '',
        descricao: '',
      });
    }
  };

  const handleSubcategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('subcategorias').insert([novaSubcategoria]);
    if (error) {
       toast({
        title: "Erro ao cadastrar subcategoria",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      toast({
        title: "Subcategoria cadastrada com sucesso!",
      });
      fetchSubcategorias();
      setNovaSubcategoria({
        nome: '',
        categoria_id: '',
      });
    }
  };

  const handleArquivoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('arquivos').insert([novoArquivo]);
    if (error) {
      toast({
        title: "Erro ao cadastrar arquivo",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      toast({
        title: "Arquivo cadastrado com sucesso!",
      });
      fetchArquivos();
      setNovoArquivo({
        produto_id: '',
        nome_arquivo: '',
        categoria_arquivo: '',
        link_url: '',
        descricao: '',
        listado: false,
      });
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('banners').insert([novoBanner]);
    if (error) {
      toast({
        title: "Erro ao cadastrar banner",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      toast({
        title: "Banner cadastrado com sucesso!",
      });
      fetchBanners();
      setNovoBanner({
        image_url: '',
        link_url: '',
        alt_text: '',
        listado: false,
      });
    }
  };

  const handleSolicitacaoUpdate = async (id: string, status: 'pendente' | 'resolvido') => {
    const { data, error } = await supabase.from('solicitacoes').update({ status }).eq('id', id);
    if (error) {
      toast({
        title: "Erro ao atualizar solicitação",
        description: error.message,
        variant: "destructive",
      });
    }
    if (data) {
      toast({
        title: "Solicitação atualizada com sucesso!",
      });
      fetchSolicitacoes();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
      
      <Tabs defaultValue="produtos" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="subcategorias">Subcategorias</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Produto</CardTitle>
              <CardDescription>Adicione um novo produto ao catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProdutoSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="partnumber">Part Number</Label>
                  <Input
                    id="partnumber"
                    value={novoProduto.partnumber}
                    onChange={(e) => setNovoProduto({...novoProduto, partnumber: e.target.value})}
                    placeholder="Número da peça"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novoProduto.descricao}
                    onChange={(e) => setNovoProduto({...novoProduto, descricao: e.target.value})}
                    placeholder="Descrição do produto"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={novoProduto.categoria_id} onValueChange={(value) => setNovoProduto({...novoProduto, categoria_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subcategoria">Subcategoria</Label>
                  <Select value={novoProduto.subcategoria_id} onValueChange={(value) => setNovoProduto({...novoProduto, subcategoria_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma subcategoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategorias.filter(subcategoria => subcategoria.categoria_id === novoProduto.categoria_id).map(subcategoria => (
                        <SelectItem key={subcategoria.id} value={subcategoria.id}>
                          {subcategoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="datasheet">Link do Datasheet</Label>
                  <Input
                    id="datasheet"
                    value={novoProduto.datasheet}
                    onChange={(e) => setNovoProduto({...novoProduto, datasheet: e.target.value})}
                    placeholder="URL do datasheet"
                  />
                </div>
                
                <div>
                  <Label htmlFor="video_url">Link do Vídeo</Label>
                  <Input
                    id="video_url"
                    value={novoProduto.video_url}
                    onChange={(e) => setNovoProduto({...novoProduto, video_url: e.target.value})}
                    placeholder="URL do vídeo"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="listado"
                    checked={novoProduto.listado}
                    onCheckedChange={(checked) => setNovoProduto({...novoProduto, listado: checked})}
                  />
                  <Label htmlFor="listado">Produto listado publicamente</Label>
                </div>
                
                <Button type="submit">Cadastrar Produto</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Categoria</CardTitle>
              <CardDescription>Adicione uma nova categoria de produto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCategoriaSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Categoria</Label>
                  <Input
                    id="nome"
                    value={novaCategoria.nome}
                    onChange={(e) => setNovaCategoria({...novaCategoria, nome: e.target.value})}
                    placeholder="Nome da categoria"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novaCategoria.descricao}
                    onChange={(e) => setNovaCategoria({...novaCategoria, descricao: e.target.value})}
                    placeholder="Descrição da categoria"
                  />
                </div>
                
                <Button type="submit">Cadastrar Categoria</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subcategorias">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Subcategoria</CardTitle>
              <CardDescription>Adicione uma nova subcategoria de produto</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubcategoriaSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome da Subcategoria</Label>
                  <Input
                    id="nome"
                    value={novaSubcategoria.nome}
                    onChange={(e) => setNovaSubcategoria({...novaSubcategoria, nome: e.target.value})}
                    placeholder="Nome da subcategoria"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoria Pai</Label>
                  <Select value={novaSubcategoria.categoria_id} onValueChange={(value) => setNovaSubcategoria({...novaSubcategoria, categoria_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit">Cadastrar Subcategoria</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arquivos">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Arquivos</CardTitle>
              <CardDescription>Cadastre novos arquivos para download</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleArquivoSubmit} className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="produto">Produto</Label>
                  <Select value={novoArquivo.produto_id} onValueChange={(value) => setNovoArquivo({...novoArquivo, produto_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map(produto => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.partnumber} - {produto.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nome_arquivo">Nome do Arquivo</Label>
                  <Input
                    id="nome_arquivo"
                    value={novoArquivo.nome_arquivo}
                    onChange={(e) => setNovoArquivo({...novoArquivo, nome_arquivo: e.target.value})}
                    placeholder="Nome do arquivo"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria_arquivo">Categoria do Arquivo</Label>
                  <Select value={novoArquivo.categoria_arquivo} onValueChange={(value) => setNovoArquivo({...novoArquivo, categoria_arquivo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firmware">Firmware</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="datasheet">Datasheet</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="certificado">Certificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="link_url"
                      value={novoArquivo.link_url}
                      onChange={(e) => setNovoArquivo({...novoArquivo, link_url: e.target.value})}
                      placeholder="URL do arquivo para download"
                      required
                      className="flex-1"
                    />
                    <FileUploadButton
                      onUploadSuccess={(url) => setNovoArquivo({...novoArquivo, link_url: url})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={novoArquivo.descricao}
                    onChange={(e) => setNovoArquivo({...novoArquivo, descricao: e.target.value})}
                    placeholder="Descrição do arquivo (opcional)"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="listado"
                    checked={novoArquivo.listado}
                    onCheckedChange={(checked) => setNovoArquivo({...novoArquivo, listado: checked})}
                  />
                  <Label htmlFor="listado">Arquivo listado publicamente</Label>
                </div>
                
                <Button type="submit">Cadastrar Arquivo</Button>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome do Arquivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Listado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {arquivos.map((arquivo) => (
                      <tr key={arquivo.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {produtos.find(produto => produto.id === arquivo.produto_id)?.partnumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{arquivo.nome_arquivo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{arquivo.categoria_arquivo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={arquivo.link_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Download
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{arquivo.listado ? 'Sim' : 'Não'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Banners</CardTitle>
              <CardDescription>Cadastre novos banners para o site</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={novoBanner.image_url}
                    onChange={(e) => setNovoBanner({...novoBanner, image_url: e.target.value})}
                    placeholder="URL da imagem do banner"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    value={novoBanner.link_url}
                    onChange={(e) => setNovoBanner({...novoBanner, link_url: e.target.value})}
                    placeholder="URL de destino do banner"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="alt_text">Texto Alternativo</Label>
                  <Input
                    id="alt_text"
                    value={novoBanner.alt_text}
                    onChange={(e) => setNovoBanner({...novoBanner, alt_text: e.target.value})}
                    placeholder="Texto alternativo para a imagem"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="listado"
                    checked={novoBanner.listado}
                    onCheckedChange={(checked) => setNovoBanner({...novoBanner, listado: checked})}
                  />
                  <Label htmlFor="listado">Banner listado publicamente</Label>
                </div>
                
                <Button type="submit">Cadastrar Banner</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solicitacoes">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Solicitações</CardTitle>
              <CardDescription>Visualize e gerencie as solicitações de contato</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto de Interesse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {solicitacoes.map((solicitacao) => (
                      <tr key={solicitacao.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{solicitacao.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{solicitacao.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{solicitacao.telefone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{solicitacao.empresa}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{solicitacao.produto_interesse}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{solicitacao.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {solicitacao.status === 'pendente' ? (
                            <Button size="sm" onClick={() => handleSolicitacaoUpdate(solicitacao.id, 'resolvido')}>
                              Marcar como Resolvido
                            </Button>
                          ) : (
                            <span className="text-green-500">Resolvido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
