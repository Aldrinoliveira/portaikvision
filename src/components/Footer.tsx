import { Facebook, Instagram, Linkedin, Youtube, Globe, Headphones, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-2">
        <section aria-label="Redes sociais" className="space-y-3">
          <div className="flex items-center gap-3">
            <img src="/images/hikvision-logo.svg" alt="Hikvision" className="h-6 w-auto" loading="lazy" />
            <span className="text-sm text-footer-foreground/80">Siga a Hikvision</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://br.linkedin.com/company/hikvisionbrasil" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://www.youtube.com/@HikvisiondoBrasilOficial" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="https://www.facebook.com/Hikvisiondobrasil/?locale=pt_BR" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/hikvisionbr/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://www.tiktok.com/@hikvisionbr" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section aria-label="Atendimento Suporte Técnico" className="space-y-3">
          <h2 className="text-sm font-medium">Atendimento Suporte Técnico</h2>
          <ul className="space-y-2 text-sm text-footer-foreground/80">
            <li className="flex items-start gap-2">
              <Headphones className="h-4 w-4 mt-0.5" />
              <span>Suporte Técnico oficial Hikvision Brasil</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5" />
              <span>De segunda a sexta das 8h às 20h, aos sábados das 8h às 18h.</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5" />
              <span>4020-4458 para capitais e regiões metropolitanas (telefone e WhatsApp)</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5" />
              <span>0800 025 4458 para demais localidades</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5" />
              <a href="mailto:suporte.br@hikvision.com" className="hover:underline">suporte.br@hikvision.com</a>
            </li>
          </ul>
        </section>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-footer-foreground/70">
          © {new Date().getFullYear()} Hikvision. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
