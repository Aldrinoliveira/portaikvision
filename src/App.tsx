
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Product from "./pages/Product";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Software from "./pages/Software";
import Ferramentas from "./pages/Ferramentas";


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('banner_title_color,banner_desc_color,banner_title_size,banner_desc_size')
        .limit(1);
      const s = (data && data[0]) as any;
      if (s) {
        const root = document.documentElement;
        if (s.banner_title_color) root.style.setProperty('--banner-title-color', s.banner_title_color);
        if (s.banner_desc_color) root.style.setProperty('--banner-desc-color', s.banner_desc_color);
        if (s.banner_title_size) root.style.setProperty('--banner-title-size', s.banner_title_size);
        if (s.banner_desc_size) root.style.setProperty('--banner-desc-size', s.banner_desc_size);
      }
    };
    load();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produto/:id" element={<Product />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/software" element={<Software />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

