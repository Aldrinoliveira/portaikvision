import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Admin() {
  const [produtos, setProdutos] = useState([]);
  const [banners, setBanners] = useState([]);
  const [arquivos, setArquivos] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [newProduto, setNewProduto] = useState({ nome: '', preco: '', descricao: '' });
  const [newBanner, setNewBanner] = useState({ titulo: '', imagem: '', link: '' });
  const [newArquivo, setNewArquivo] = useState({ nome: '', url: '' });

  useEffect(() => {
    // Mock data for demonstration
    setProdutos([
      { id: 1, nome: 'Produto A', preco: 'R$50', descricao: 'Descrição do Produto A' },
      { id: 2, nome: 'Produto B', preco: 'R$80', descricao: 'Descrição do Produto B' }
    ]);
    setBanners([
      { id: 1, titulo: 'Banner X', imagem: 'url_imagem_x', link: 'link_x' },
      { id: 2, titulo: 'Banner Y', imagem: 'url_imagem_y', link: 'link_y' }
    ]);
    setArquivos([
      { id: 1, nome: 'Arquivo 1', url: 'url_arquivo_1' },
      { id: 2, nome: 'Arquivo 2', url: 'url_arquivo_2' }
    ]);
    setSolicitacoes([
      { id: 1, descricao: 'Solicitação 1' },
      { id: 2, descricao: 'Solicitação 2' }
    ]);
  }, []);

  const handleProdutoSubmit = (e: any) => {
    e.preventDefault();
    setProdutos([...produtos, { id: produtos.length + 1, ...newProduto }]);
    setNewProduto({ nome: '', preco: '', descricao: '' });
    toast.success("Produto Adicionado")
  };

  const handleBannerSubmit = (e: any) => {
    e.preventDefault();
    setBanners([...banners, { id: banners.length + 1, ...newBanner }]);
    setNewBanner({ titulo: '', imagem: '', link: '' });
    toast.success("Banner Adicionado")
  };

  const handleArquivoSubmit = (e: any) => {
    e.preventDefault();
    setArquivos([...arquivos, { id: arquivos.length + 1, ...newArquivo }]);
    setNewArquivo({ nome: '', url: '' });
    toast.success("Arquivo Adicionado")
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-2">Gerencie produtos, banners, arquivos e configurações do site</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="transform scale-130 flex items-center justify-center min-h-[120px]">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Total de Produtos</h3>
            <p className="text-3xl font-bold text-primary">{produtos.length}</p>
          </CardContent>
        </Card>
        
        <Card className="transform scale-130 flex items-center justify-center min-h-[120px]">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Total de Banners</h3>
            <p className="text-3xl font-bold text-primary">{banners.length}</p>
          </CardContent>
        </Card>
        
        <Card className="transform scale-130 flex items-center justify-center min-h-[120px]">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Total de Arquivos</h3>
            <p className="text-3xl font-bold text-primary">{arquivos.length}</p>
          </CardContent>
        </Card>
        
        <Card className="transform scale-130 flex items-center justify-center min-h-[120px]">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Solicitações</h3>
            <p className="text-3xl font-bold text-primary">{solicitacoes.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
        <TabsContent value="produtos">
          <h2 className="text-2xl font-bold mb-4">Gerenciar Produtos</h2>
          <form onSubmit={handleProdutoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input id="nome" type="text" value={newProduto.nome} onChange={(e) => setNewProduto({ ...newProduto, nome: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="preco">Preço</Label>
              <Input id="preco" type="text" value={newProduto.preco} onChange={(e) => setNewProduto({ ...newProduto, preco: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" type="text" value={newProduto.descricao} onChange={(e) => setNewProduto({ ...newProduto, descricao: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Adicionar Produto</Button>
            </div>
          </form>

          <Table>
            <TableCaption>A list of your products.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.id}</TableCell>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.preco}</TableCell>
                  <TableCell className="text-right">{produto.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="banners">
          <h2 className="text-2xl font-bold mb-4">Gerenciar Banners</h2>
          <form onSubmit={handleBannerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título do Banner</Label>
              <Input id="titulo" type="text" value={newBanner.titulo} onChange={(e) => setNewBanner({ ...newBanner, titulo: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="imagem">URL da Imagem</Label>
              <Input id="imagem" type="text" value={newBanner.imagem} onChange={(e) => setNewBanner({ ...newBanner, imagem: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="link">Link do Banner</Label>
              <Input id="link" type="text" value={newBanner.link} onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Adicionar Banner</Button>
            </div>
          </form>

          <Table>
            <TableCaption>A list of your banners.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Imagem</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium">{banner.id}</TableCell>
                  <TableCell>{banner.titulo}</TableCell>
                  <TableCell>{banner.imagem}</TableCell>
                  <TableCell className="text-right">{banner.link}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="arquivos">
          <h2 className="text-2xl font-bold mb-4">Gerenciar Arquivos</h2>
          <form onSubmit={handleArquivoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Arquivo</Label>
              <Input id="nome" type="text" value={newArquivo.nome} onChange={(e) => setNewArquivo({ ...newArquivo, nome: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="url">URL do Arquivo</Label>
              <Input id="url" type="text" value={newArquivo.url} onChange={(e) => setNewArquivo({ ...newArquivo, url: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Adicionar Arquivo</Button>
            </div>
          </form>

          <Table>
            <TableCaption>A list of your arquivos.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {arquivos.map((arquivo) => (
                <TableRow key={arquivo.id}>
                  <TableCell className="font-medium">{arquivo.id}</TableCell>
                  <TableCell>{arquivo.nome}</TableCell>
                  <TableCell className="text-right">{arquivo.url}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="solicitacoes">
          <h2 className="text-2xl font-bold mb-4">Gerenciar Solicitações</h2>
          <Table>
            <TableCaption>A list of your solicitações.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="text-right">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitacoes.map((solicitacao) => (
                <TableRow key={solicitacao.id}>
                  <TableCell className="font-medium">{solicitacao.id}</TableCell>
                  <TableCell className="text-right">{solicitacao.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="configuracoes">
          <h2 className="text-2xl font-bold mb-4">Configurações do Site</h2>
          <div>
            <p>Em breve, mais opções de configuração estarão disponíveis.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
