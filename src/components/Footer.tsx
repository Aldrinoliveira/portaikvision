import { Facebook, Instagram, Linkedin, Youtube, Globe, Headphones } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-2">
        <section aria-label="Redes sociais" className="space-y-3">
          <div className="flex items-center gap-3">
            <img src="/images/hikvision-logo.svg" alt="Hikvision" className="h-6 w-auto" loading="lazy" />
            <span className="text-sm text-muted-foreground">Siga a Hikvision</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.linkedin.com/company/hikvision/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://www.youtube.com/user/HikvisionDigital" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="https://www.facebook.com/Hikvision/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.instagram.com/hikvisionglobal/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section aria-label="Suporte Hikvision" className="space-y-3">
          <h2 className="text-sm font-medium">Suporte Hikvision</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <a href="https://www.hikvision.com/pt-br/support/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Central de Suporte
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <a href="https://www.hikvision.com/pt-br/support/download/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Downloads
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <a href="https://www.hikvision.com/pt-br/contact-us/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Contato
              </a>
            </li>
          </ul>
        </section>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hikvision. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
