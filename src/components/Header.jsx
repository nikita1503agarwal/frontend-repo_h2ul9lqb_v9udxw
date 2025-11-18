import { Link, useLocation } from "react-router-dom";

export default function Header({ customer, onLogout }) {
  const { pathname } = useLocation();
  const link = (to, label) => (
    <Link to={to} className={`px-3 py-1.5 rounded text-sm transition-colors ${pathname === to ? 'bg-white/20 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>{label}</Link>
  );
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-semibold">
          <span className="inline-block w-6 h-6 rounded bg-blue-500"></span>
          DineFlow
        </Link>
        <nav className="flex items-center gap-2">
          {link('/', 'Dashboard')}
          {link('/waitlist', 'Waitlist')}
          {link('/profile', 'Profile')}
        </nav>
        <div>
          {customer ? (
            <div className="flex items-center gap-3">
              <span className="text-blue-200 text-sm">{customer.name || customer.email}</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded bg-red-500/80 hover:bg-red-500 text-white text-xs">Logout</button>
            </div>
          ) : (
            <span className="text-blue-300/70 text-sm">Guest</span>
          )}
        </div>
      </div>
    </header>
  );
}
