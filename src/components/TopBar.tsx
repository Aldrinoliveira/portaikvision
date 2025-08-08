import { Link } from "react-router-dom";

const TopBar = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-semibold text-lg" aria-label="Hikvision Home">
        <img src="/images/hikvision-logo.svg" alt="Hikvision – logo" className="h-6 w-auto" width={100} height={18} loading="eager" />
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/#produtos" className="hover:underline">Produtos</Link>
        <Link to="/software" className="hover:underline">Software</Link>
        <Link to="/ferramentas" className="hover:underline">Ferramentas</Link>
        <Link to="/auth" className="hover:underline">Entrar</Link>
        <Link to="/admin" className="hover:underline">Admin</Link>
      </nav>
    </div>
  </header>
);

export default TopBar;
