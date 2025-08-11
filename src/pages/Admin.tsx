
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload as UploadIcon } from 'lucide-react';
import { GoogleDriveUpload } from '@/components/GoogleDriveUpload';

interface Produto {
  id: string;
  created_at: string;
  partnumber: string;
  descricao: string;
  categoria_id: string;
  subcategoria_id: string;
  imagem_url: string;
}

interface Arquivo {
  id?: string;
  created_at?: string;
  produto_id: string;
  categoria_arquivo: 'firmware' | 'manual' | 'datasheet' | 'video' | 'software' | 'outros';
  nome_arquivo: string;
  link_url: string;
  descricao?: string;
  downloads?: number;
  listado?: boolean;
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
}

export default function Admin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novoProduto, setNovoProduto] = useState<Omit<Produto, 'id' | 'created_at'>>({
    partnumber: '',
    descricao: '',
    categoria_id: '',
    subcategoria_id: '',
    imagem_url: '',
  });
  const [novoArquivo, setNovoArquivo] = useState<Omit<Arquivo, 'id' | 'created_at'>>({
    produto_id: '',
    categoria_arquivo: 'firmware',
    nome_arquivo: '',
    link_url: '',
    descricao: '',
  });
  const [editandoProduto, setEditandoProduto] = useState<string | null>(null);
  const [editandoArquivo, setEditandoArquivo] = useState<string | null>(null);

  useEffect(() => {
    fetchProdutos();
    fetchArquivos();
    fetchCategorias();
  }, []);

  async function fetchProdutos() {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) {
      console.error('Erro ao buscar produtos:', error);
    } else {
      setProdutos(data || []);
    }
  }

  async function fetchArquivos() {
    const { data, error } = await supabase.from('arquivos').select('*');
    if (error) {
      console.error('Erro ao buscar arquivos:', error);
    } else {
      setArquivos(data || []);
    }
  }

  async function fetchCategorias() {
    const { data, error } = await supabase.from('categorias').select('*');
    if (error) {
      console.error('Erro ao buscar categorias:', error);
    } else {
      setCategorias(data || []);
    }
  }

  async function adicionarProduto() {
    if (editandoProduto) {
      // Atualizar produto existente
      const { data, error } = await supabase
        .from('produtos')
        .update(novoProduto)
        .eq('id', editandoProduto);

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        toast.error('Erro ao atualizar produto.');
      } else {
        toast.success('Produto atualizado com sucesso!');
        fetchProdutos();
        setEditandoProduto(null);
      }
    } else {
      // Adicionar novo produto
      const { data, error } = await supabase.from('produtos').insert([novoProduto]);
      if (error) {
        console.error('Erro ao adicionar produto:', error);
        toast.error('Erro ao adicionar produto.');
      } else {
        toast.success('Produto adicionado com sucesso!');
        fetchProdutos();
      }
    }
    
    setNovoProduto({
      partnumber: '',
      descricao: '',
      categoria_id: '',
      subcategoria_id: '',
      imagem_url: '',
    });
  }

  async function adicionarArquivo() {
    if (editandoArquivo) {
      // Atualizar arquivo existente
      const { data, error } = await supabase
        .from('arquivos')
        .update(novoArquivo)
        .eq('id', editandoArquivo);

      if (error) {
        console.error('Erro ao atualizar arquivo:', error);
        toast.error('Erro ao atualizar arquivo.');
      } else {
        toast.success('Arquivo atualizado com sucesso!');
        fetchArquivos();
        setEditandoArquivo(null);
      }
    } else {
      // Adicionar novo arquivo
      const { data, error } = await supabase.from('arquivos').insert([novoArquivo]);
      if (error) {
        console.error('Erro ao adicionar arquivo:', error);
        toast.error('Erro ao adicionar arquivo.');
      } else {
        toast.success('Arquivo adicionado com sucesso!');
        fetchArquivos();
      }
    }

    setNovoArquivo({
      produto_id: '',
      categoria_arquivo: 'firmware',
      nome_arquivo: '',
      link_url: '',
      descricao: '',
    });
  }

  async function deletarProduto(id: string) {
    const confirmacao = window.confirm('Tem certeza que deseja deletar este produto?');
    if (confirmacao) {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar produto:', error);
        toast.error('Erro ao deletar produto.');
      } else {
        toast.success('Produto deletado com sucesso!');
        setProdutos(produtos.filter(produto => produto.id !== id));
      }
    }
  }

  async function deletarArquivo(id: string) {
    const confirmacao = window.confirm('Tem certeza que deseja deletar este arquivo?');
    if (confirmacao) {
      const { error } = await supabase.from('arquivos').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        toast.error('Erro ao deletar arquivo.');
      } else {
        toast.success('Arquivo deletado com sucesso!');
        setArquivos(arquivos.filter(arquivo => arquivo.id !== id));
      }
    }
  }

  const handleGoogleDriveUpload = (downloadLink: string, fileName: string) => {
    setNovoArquivo(prev => ({
      ...prev,
      nome_arquivo: fileName,
      link_url: downloadLink
    }));
    toast.success('Link do Google Drive adicionado automaticamente!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
      
      {/* Seção de Produtos */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Gerenciar Produtos</h2>
        
        {/* Formulário de Novo Produto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="partnumber">Part Number</Label>
            <Input
              id="partnumber"
              value={novoProduto.partnumber}
              onChange={(e) => setNovoProduto({...novoProduto, partnumber: e.target.value})}
              placeholder="Part Number"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={novoProduto.descricao}
              onChange={(e) => setNovoProduto({...novoProduto, descricao: e.target.value})}
              placeholder="Descrição"
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={novoProduto.categoria_id} onValueChange={(value) => setNovoProduto({...novoProduto, categoria_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="imagem_url">URL da Imagem</Label>
            <Input
              id="imagem_url"
              value={novoProduto.imagem_url}
              onChange={(e) => setNovoProduto({...novoProduto, imagem_url: e.target.value})}
              placeholder="URL da imagem"
            />
          </div>
        </div>

        <Button onClick={adicionarProduto} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {editandoProduto ? 'Atualizar Produto' : 'Adicionar Produto'}
        </Button>

        {/* Tabela de Produtos */}
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Part Number
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {produto.partnumber}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {produto.descricao}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {categorias.find(cat => cat.id === produto.categoria_id)?.nome || 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Button variant="secondary" size="sm" className="mr-2" onClick={() => {
                      setEditandoProduto(produto.id);
                      setNovoProduto({
                        partnumber: produto.partnumber,
                        descricao: produto.descricao,
                        categoria_id: produto.categoria_id,
                        subcategoria_id: produto.subcategoria_id,
                        imagem_url: produto.imagem_url,
                      });
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deletarProduto(produto.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Arquivos */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Gerenciar Arquivos</h2>
        
        {/* Upload para Google Drive */}
        <div className="mb-6">
          <GoogleDriveUpload onUploadSuccess={handleGoogleDriveUpload} />
        </div>

        {/* Formulário de Novo Arquivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="produto">Produto</Label>
            <Select value={novoArquivo.produto_id} onValueChange={(value) => setNovoArquivo({...novoArquivo, produto_id: value})}>
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

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={novoArquivo.categoria_arquivo} onValueChange={(value) => setNovoArquivo({...novoArquivo, categoria_arquivo: value as any})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firmware">Firmware</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="datasheet">Datasheet</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
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
            />
          </div>

          <div>
            <Label htmlFor="link_url">URL do Arquivo</Label>
            <Input
              id="link_url"
              value={novoArquivo.link_url}
              onChange={(e) => setNovoArquivo({...novoArquivo, link_url: e.target.value})}
              placeholder="URL do arquivo"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea
            id="descricao"
            value={novoArquivo.descricao}
            onChange={(e) => setNovoArquivo({...novoArquivo, descricao: e.target.value})}
            placeholder="Descrição do arquivo"
          />
        </div>

        <Button onClick={adicionarArquivo} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {editandoArquivo ? 'Atualizar Arquivo' : 'Adicionar Arquivo'}
        </Button>

        {/* Tabela de Arquivos */}
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nome do Arquivo
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  URL do Arquivo
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map((arquivo) => (
                <tr key={arquivo.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {produtos.find(produto => produto.id === arquivo.produto_id)?.partnumber || 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {arquivo.categoria_arquivo}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {arquivo.nome_arquivo}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <a href={arquivo.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Abrir Link
                    </a>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {arquivo.downloads || 0}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Button variant="secondary" size="sm" className="mr-2" onClick={() => {
                      setEditandoArquivo(arquivo.id);
                      setNovoArquivo({
                        produto_id: arquivo.produto_id,
                        categoria_arquivo: arquivo.categoria_arquivo,
                        nome_arquivo: arquivo.nome_arquivo,
                        link_url: arquivo.link_url,
                        descricao: arquivo.descricao,
                      });
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deletarArquivo(arquivo.id!)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
