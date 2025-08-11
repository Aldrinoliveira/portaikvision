import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
const useSEO = () => {
  useEffect(() => {
    document.title = "Entrar ou Cadastrar – Hikvision";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Faça login ou crie sua conta para administrar o conteúdo.");
  }, []);
};
const Auth = () => {
  useSEO();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        navigate("/", {
          replace: true
        });
      }
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session?.user) navigate("/", {
        replace: true
      });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  const signIn = async () => {
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) toast({
      title: "Erro no login",
      description: error.message
    });
  };
  const signUp = async () => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    setLoading(false);
    if (error) toast({
      title: "Erro no cadastro",
      description: error.message
    });else toast({
      title: "Verifique seu e-mail",
      description: "Confirme o cadastro para acessar."
    });
  };
  return <main className="min-h-[70vh] container mx-auto px-4 py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Entrar" : "Cadastrar"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={mode === "login" ? signIn : signUp} disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
            </Button>
            
          </div>
        </CardContent>
      </Card>
    </main>;
};
export default Auth;