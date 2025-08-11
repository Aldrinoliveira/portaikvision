import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, FileText, Settings, BarChart3 } from "lucide-react";

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { name: 'Visão Geral', href: '#', icon: BarChart3, current: activeTab === 'overview', key: 'overview' },
    { name: 'Usuários', href: '#', icon: Users, current: activeTab === 'users', key: 'users' },
    { name: 'Conteúdo', href: '#', icon: FileText, current: activeTab === 'content', key: 'content' },
    { name: 'Analytics', href: '#', icon: BarChart3, current: activeTab === 'analytics', key: 'analytics' },
    { name: 'Configurações', href: '#', icon: Settings, current: activeTab === 'settings', key: 'settings' },
  ]

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="font-bold text-xl">Admin Panel</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={classNames(
                        item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                        'px-3 py-2 rounded-md text-sm font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                      variant={item.current ? 'default' : 'ghost'}
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Total de Usuários</CardTitle>
                  <CardDescription>Número total de usuários cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,450</div>
                  <Badge variant="secondary">+20%</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total de Produtos</CardTitle>
                  <CardDescription>Número total de produtos cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">350</div>
                  <Badge variant="secondary">+10%</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total de Pedidos</CardTitle>
                  <CardDescription>Número total de pedidos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">800</div>
                  <Badge variant="secondary">+15%</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Receita Total</CardTitle>
                  <CardDescription>Receita total gerada pelas vendas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ 120,000</div>
                  <Badge variant="secondary">+5%</Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>Gerenciar usuários do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                Lista de usuários aqui
              </CardContent>
            </Card>
          )}

          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Gerenciar produtos do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Nome do Produto</Label>
                    <Input id="product-name" placeholder="Digite o nome do produto..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-description">Descrição</Label>
                    <Textarea id="product-description" placeholder="Descrição do produto..." />
                  </div>
                  <Button className="w-full">Salvar Produto</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Arquivos</CardTitle>
                  <CardDescription>Gerenciar arquivos do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-name">Nome do Arquivo</Label>
                    <Input id="file-name" placeholder="Digite o nome do arquivo..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file-url">Link URL</Label>
                    <div className="flex gap-2">
                      <Input id="file-url" placeholder="https://..." className="flex-1" />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file-description">Descrição</Label>
                    <Textarea id="file-description" placeholder="Descrição do arquivo..." />
                  </div>
                  <Button className="w-full">Salvar Arquivo</Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Visualização de dados e métricas</CardDescription>
              </CardHeader>
              <CardContent>
                Conteúdo de analytics aqui
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Gerenciar configurações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                Configurações aqui
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
