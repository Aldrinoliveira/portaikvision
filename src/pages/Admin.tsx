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
  categoria: string;
  preco: number;
  imagens: string[];
  estoque: number;
}

interface Arquivo {
  id?: string;
  created_at?: string;
  produto_id: string;
  categoria_arquivo: 'firmware' | 'manual' | 'datasheet' | 'video' | 'software' | 'outros';
  nome_arquivo: string;
  link_url: string;
  descricao?: string;
}

interface Cliente {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
}

export default function Admin() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoProduto, setNovoProduto] = useState<Omit<Produto, 'id' | 'created_at'>>({
    partnumber: '',
    descricao: '',
    categoria: '',
    preco: 0,
    imagens: [],
    estoque: 0,
  });
  const [novoArquivo, setNovoArquivo] = useState<Arquivo>({
    produto_id: '',
    categoria_arquivo: 'firmware',
    nome_arquivo: '',
    link_url: '',
    descricao: '',
  });
  const [novoCliente, setNovoCliente] = useState<Omit<Cliente, 'id' | 'created_at'>>({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
  });
  const [editandoProduto, setEditandoProduto] = useState<string | null>(null);
  const [editandoArquivo, setEditandoArquivo] = useState<string | null>(null);
  const [editandoCliente, setEditandoCliente] = useState<string | null>(null);

  useEffect(() => {
    fetchProdutos();
    fetchArquivos();
    fetchClientes();
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

  async function fetchClientes() {
    const { data, error } = await supabase.from('clientes').select('*');
    if (error) {
      console.error('Erro ao buscar clientes:', error);
    } else {
      setClientes(data || []);
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
        setProdutos(produtos.map(produto => produto.id === editandoProduto ? {...produto, ...novoProduto} : produto));
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
      categoria: '',
      preco: 0,
      imagens: [],
      estoque: 0,
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
        setArquivos(arquivos.map(arquivo => arquivo.id === editandoArquivo ? {...arquivo, ...novoArquivo} : arquivo));
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

  async function adicionarCliente() {
    if (editandoCliente) {
      // Atualizar cliente existente
      const { data, error } = await supabase
        .from('clientes')
        .update(novoCliente)
        .eq('id', editandoCliente);

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        toast.error('Erro ao atualizar cliente.');
      } else {
        toast.success('Cliente atualizado com sucesso!');
        setClientes(clientes.map(cliente => cliente.id === editandoCliente ? {...cliente, ...novoCliente} : cliente));
        setEditandoCliente(null);
      }
    } else {
      // Adicionar novo cliente
      const { data, error } = await supabase.from('clientes').insert([novoCliente]);
      if (error) {
        console.error('Erro ao adicionar cliente:', error);
        toast.error('Erro ao adicionar cliente.');
      } else {
        toast.success('Cliente adicionado com sucesso!');
        fetchClientes();
      }
    }

    setNovoCliente({
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
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

  async function deletarCliente(id: string) {
    const confirmacao = window.confirm('Tem certeza que deseja deletar este cliente?');
    if (confirmacao) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) {
        console.error('Erro ao deletar cliente:', error);
        toast.error('Erro ao deletar cliente.');
      } else {
        toast.success('Cliente deletado com sucesso!');
        setClientes(clientes.filter(cliente => cliente.id !== id));
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <Input
              id="categoria"
              value={novoProduto.categoria}
              onChange={(e) => setNovoProduto({...novoProduto, categoria: e.target.value})}
              placeholder="Categoria"
            />
          </div>

          <div>
            <Label htmlFor="preco">Preço</Label>
            <Input
              id="preco"
              type="number"
              value={novoProduto.preco}
              onChange={(e) => setNovoProduto({...novoProduto, preco: parseFloat(e.target.value)})}
              placeholder="Preço"
            />
          </div>

          <div>
            <Label htmlFor="estoque">Estoque</Label>
            <Input
              id="estoque"
              type="number"
              value={novoProduto.estoque}
              onChange={(e) => setNovoProduto({...novoProduto, estoque: parseInt(e.target.value)})}
              placeholder="Estoque"
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
                  Preço
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estoque
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
                    {produto.categoria}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {produto.preco}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {produto.estoque}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Button variant="secondary" size="sm" onClick={() => {
                      setEditandoProduto(produto.id);
                      setNovoProduto({
                        partnumber: produto.partnumber,
                        descricao: produto.descricao,
                        categoria: produto.categoria,
                        preco: produto.preco,
                        imagens: produto.imagens,
                        estoque: produto.estoque,
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
                    <Button variant="secondary" size="sm" onClick={() => {
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
                    <Button variant="destructive" size="sm" onClick={() => deletarArquivo(arquivo.id)}>
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

      {/* Seção de Clientes */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Gerenciar Clientes</h2>

        {/* Formulário de Novo Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={novoCliente.nome}
              onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
              placeholder="Nome"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={novoCliente.email}
              onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
              placeholder="Email"
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={novoCliente.telefone}
              onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
              placeholder="Telefone"
            />
          </div>

          <div>
            <Label htmlFor="empresa">Empresa</Label>
            <Input
              id="empresa"
              value={novoCliente.empresa}
              onChange={(e) => setNovoCliente({...novoCliente, empresa: e.target.value})}
              placeholder="Empresa"
            />
          </div>
        </div>

        <Button onClick={adicionarCliente} className="mb-6">
          <Plus className="w-4 h-4 mr-2" />
          {editandoCliente ? 'Atualizar Cliente' : 'Adicionar Cliente'}
        </Button>

        {/* Tabela de Clientes */}
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {cliente.nome}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {cliente.email}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {cliente.telefone}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {cliente.empresa}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Button variant="secondary" size="sm" onClick={() => {
                      setEditandoCliente(cliente.id);
                      setNovoCliente({
                        nome: cliente.nome,
                        email: cliente.email,
                        telefone: cliente.telefone,
                        empresa: cliente.empresa,
                      });
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deletarCliente(cliente.id)}>
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
