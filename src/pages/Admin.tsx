import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FileUploadButton } from '@/components/FileUploadButton';

interface Produto {
  id: string;
  partnumber: string;
  descricao: string;
  categoria: string;
  preco: number;
  listado: boolean;
  imagem_url?: string;
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
}

interface Banner {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url: string;
  link_url?: string;
  ativo: boolean;
  ordem: number;
}

interface Arquivo {
  id: string;
  nome_arquivo: string;
  categoria_arquivo: string;
  descricao: string;
  link_url: string;
  produto_id: string;
  listado: boolean;
  created_at: string;
}

interface SolicitacaoOrcamento {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  mensagem: string;
  created_at: string;
  status: string;
}

export default function Admin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoOrcamento[]>([]);

  const [novoProduto, setNovoProduto] = useState({
    partnumber: '',
    descricao: '',
    categoria: '',
    preco: 0,
    listado: true,
    imagem_url: ''
  });

  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    descricao: ''
  });

  const [novoBanner, setNovoBanner] = useState({
    titulo: '',
    descricao: '',
    imagem_url: '',
    link_url: '',
    ativo: true,
    ordem: 1
  });

  const [novoArquivo, setNovoArquivo] = useState({
    nome_arquivo: '',
    categoria_arquivo: '',
    descricao: '',
    link_url: '',
    produto_id: '',
    listado: true
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    await Promise.all([
      carregarProdutos(),
      carregarCategorias(),
      carregarBanners(),
      carregarArquivos(),
      carregarSolicitacoes()
    ]);
  };

  const carregarProdutos = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('partnumber');
    
    if (error) {
      console.error('Erro ao carregar produtos:', error);
    } else {
      setProdutos(data || []);
    }
  };

  const carregarCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome');
    
    if (error) {
      console.error('Erro ao carregar categorias:', error);
    } else {
      setCategorias(data || []);
    }
  };

  const carregarBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('ordem');
    
    if (error) {
      console.error('Erro ao carregar banners:', error);
    } else {
      setBanners(data || []);
    }
  };

  const carregarArquivos = async () => {
    const { data, error } = await supabase
      .from('arquivos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar arquivos:', error);
    } else {
      setArquivos(data || []);
    }
  };

  const carregarSolicitacoes = async () => {
    const { data, error } = await supabase
      .from('solicitacoes_orcamento')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar solicitações:', error);
    } else {
      setSolicitacoes(data || []);
    }
  };

  const adicionarProduto = async () => {
    const { error } = await supabase
      .from('produtos')
      .insert([novoProduto]);

    if (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto');
    } else {
      setNovoProduto({
        partnumber: '',
        descricao: '',
        categoria: '',
        preco: 0,
        listado: true,
        imagem_url: ''
      });
      carregarProdutos();
    }
  };

  const adicionarCategoria = async () => {
    const { error } = await supabase
      .from('categorias')
      .insert([novaCategoria]);

    if (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao adicionar categoria');
    } else {
      setNovaCategoria({
        nome: '',
        descricao: ''
      });
      carregarCategorias();
    }
  };

  const adicionarBanner = async () => {
    const { error } = await supabase
      .from('banners')
      .insert([novoBanner]);

    if (error) {
      console.error('Erro ao adicionar banner:', error);
      alert('Erro ao adicionar banner');
    } else {
      setNovoBanner({
        titulo: '',
        descricao: '',
        imagem_url: '',
        link_url: '',
        ativo: true,
        ordem: 1
      });
      carregarBanners();
    }
  };

  const adicionarArquivo = async () => {
    const { error } = await supabase
      .from('arquivos')
      .insert([novoArquivo]);

    if (error) {
      console.error('Erro ao adicionar arquivo:', error);
      alert('Erro ao adicionar arquivo');
    } else {
      setNovoArquivo({
        nome_arquivo: '',
        categoria_arquivo: '',
        descricao: '',
        link_url: '',
        produto_id: '',
        listado: true
      });
      carregarArquivos();
    }
  };

  const excluirProduto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
      } else {
        carregarProdutos();
      }
    }
  };

  const excluirCategoria = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
      } else {
        carregarCategorias();
      }
    }
  };

  const excluirBanner = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir banner:', error);
        alert('Erro ao excluir banner');
      } else {
        carregarBanners();
      }
    }
  };

  const excluirArquivo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
      const { error } = await supabase
        .from('arquivos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir arquivo:', error);
        alert('Erro ao excluir arquivo');
      } else {
        carregarArquivos();
      }
    }
  };

  const atualizarStatusSolicitacao = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('solicitacoes_orcamento')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    } else {
      carregarSolicitacoes();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Produtos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partnumber">Part Number</Label>
                  <Input
                    id="partnumber"
                    value={novoProduto.partnumber}
                    onChange={(e) => setNovoProduto({ ...novoProduto, partnumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select 
                    value={novoProduto.categoria} 
                    onValueChange={(value) => setNovoProduto({ ...novoProduto, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.nome}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoProduto.descricao}
                  onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preco">Preço</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({ ...novoProduto, preco: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="imagem">URL da Imagem</Label>
                  <Input
                    id="imagem"
                    value={novoProduto.imagem_url}
                    onChange={(e) => setNovoProduto({ ...novoProduto, imagem_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="listado"
                  checked={novoProduto.listado}
                  onCheckedChange={(checked) => 
                    setNovoProduto({ ...novoProduto, listado: checked as boolean })
                  }
                />
                <Label htmlFor="listado">Listado no site</Label>
              </div>

              <Button onClick={adicionarProduto}>Adicionar Produto</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.partnumber}</TableCell>
                      <TableCell>{produto.descricao}</TableCell>
                      <TableCell>{produto.categoria}</TableCell>
                      <TableCell>R$ {produto.preco.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={produto.listado ? "default" : "secondary"}>
                          {produto.listado ? "Listado" : "Não listado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => excluirProduto(produto.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Categorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoria-nome">Nome da Categoria</Label>
                <Input
                  id="categoria-nome"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="categoria-descricao">Descrição</Label>
                <Textarea
                  id="categoria-descricao"
                  value={novaCategoria.descricao}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
                />
              </div>

              <Button onClick={adicionarCategoria}>Adicionar Categoria</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorias Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell className="font-medium">{categoria.nome}</TableCell>
                      <TableCell>{categoria.descricao}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => excluirCategoria(categoria.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banner-titulo">Título</Label>
                  <Input
                    id="banner-titulo"
                    value={novoBanner.titulo}
                    onChange={(e) => setNovoBanner({ ...novoBanner, titulo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="banner-ordem">Ordem</Label>
                  <Input
                    id="banner-ordem"
                    type="number"
                    value={novoBanner.ordem}
                    onChange={(e) => setNovoBanner({ ...novoBanner, ordem: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="banner-descricao">Descrição</Label>
                <Textarea
                  id="banner-descricao"
                  value={novoBanner.descricao}
                  onChange={(e) => setNovoBanner({ ...novoBanner, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banner-imagem">URL da Imagem</Label>
                  <Input
                    id="banner-imagem"
                    value={novoBanner.imagem_url}
                    onChange={(e) => setNovoBanner({ ...novoBanner, imagem_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="banner-link">Link URL (opcional)</Label>
                  <Input
                    id="banner-link"
                    value={novoBanner.link_url}
                    onChange={(e) => setNovoBanner({ ...novoBanner, link_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="banner-ativo"
                  checked={novoBanner.ativo}
                  onCheckedChange={(checked) => 
                    setNovoBanner({ ...novoBanner, ativo: checked as boolean })
                  }
                />
                <Label htmlFor="banner-ativo">Banner ativo</Label>
              </div>

              <Button onClick={adicionarBanner}>Adicionar Banner</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banners Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ordem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{banner.titulo}</TableCell>
                      <TableCell>{banner.descricao}</TableCell>
                      <TableCell>{banner.ordem}</TableCell>
                      <TableCell>
                        <Badge variant={banner.ativo ? "default" : "secondary"}>
                          {banner.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => excluirBanner(banner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arquivos">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Arquivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="arquivo-nome">Nome do Arquivo</Label>
                  <Input
                    id="arquivo-nome"
                    value={novoArquivo.nome_arquivo}
                    onChange={(e) => setNovoArquivo({ ...novoArquivo, nome_arquivo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="arquivo-categoria">Categoria do Arquivo</Label>
                  <Input
                    id="arquivo-categoria"
                    value={novoArquivo.categoria_arquivo}
                    onChange={(e) => setNovoArquivo({ ...novoArquivo, categoria_arquivo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arquivo-descricao">Descrição</Label>
                <Textarea
                  id="arquivo-descricao"
                  value={novoArquivo.descricao}
                  onChange={(e) => setNovoArquivo({ ...novoArquivo, descricao: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="arquivo-link">Link URL</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="arquivo-link"
                    value={novoArquivo.link_url}
                    onChange={(e) => setNovoArquivo({ ...novoArquivo, link_url: e.target.value })}
                    placeholder="https://exemplo.com/arquivo.pdf"
                  />
                  <FileUploadButton 
                    onUploadSuccess={(url) => setNovoArquivo({ ...novoArquivo, link_url: url })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="arquivo-produto">Produto Relacionado</Label>
                <Select 
                  value={novoArquivo.produto_id} 
                  onValueChange={(value) => setNovoArquivo({ ...novoArquivo, produto_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.partnumber} - {produto.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="arquivo-listado"
                  checked={novoArquivo.listado}
                  onCheckedChange={(checked) => 
                    setNovoArquivo({ ...novoArquivo, listado: checked as boolean })
                  }
                />
                <Label htmlFor="arquivo-listado">Listado no site</Label>
              </div>

              <Button onClick={adicionarArquivo}>Adicionar Arquivo</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arquivos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arquivos.map((arquivo) => (
                    <TableRow key={arquivo.id}>
                      <TableCell className="font-medium">{arquivo.nome_arquivo}</TableCell>
                      <TableCell>{arquivo.categoria_arquivo}</TableCell>
                      <TableCell>{arquivo.descricao}</TableCell>
                      <TableCell>
                        <Badge variant={arquivo.listado ? "default" : "secondary"}>
                          {arquivo.listado ? "Listado" : "Não listado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => excluirArquivo(arquivo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solicitacoes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((solicitacao) => (
                    <TableRow key={solicitacao.id}>
                      <TableCell className="font-medium">{solicitacao.nome}</TableCell>
                      <TableCell>{solicitacao.email}</TableCell>
                      <TableCell>{solicitacao.empresa}</TableCell>
                      <TableCell>
                        {new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            solicitacao.status === 'pendente' ? 'destructive' :
                            solicitacao.status === 'em_andamento' ? 'default' : 'secondary'
                          }
                        >
                          {solicitacao.status === 'pendente' ? 'Pendente' :
                           solicitacao.status === 'em_andamento' ? 'Em Andamento' : 'Concluído'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={solicitacao.status} 
                          onValueChange={(value) => atualizarStatusSolicitacao(solicitacao.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="concluido">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
