import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

const TopBar = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-semibold text-lg" aria-label="Hikvision Home">
        <img src="/images/hikvision-logo.svg" alt="Hikvision – logo" className="h-6 w-auto" width={100} height={18} loading="eager" />
      </Link>
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link to="/#produtos" className="hover:underline">Produtos</Link>
        <Link to="/software" className="hover:underline">Software</Link>
        <Link to="/ferramentas" className="hover:underline">Ferramentas</Link>
      </nav>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>
              <Link to="/#produtos" className="w-full">Produtos</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/software" className="w-full">Software</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/ferramentas" className="w-full">Ferramentas</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
);

export default TopBar;
