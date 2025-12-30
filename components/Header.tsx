
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';
import { EventSnapLogoIcon, UserIcon, SettingsIcon, LifeBuoyIcon, KeyIcon, MoonIcon, SunIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 w-full items-center justify-between px-8">

        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <EventSnapLogoIcon className="h-6 w-6" />
            <span className="inline-block font-bold text-xl tracking-tight">EventSnap</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-semibold transition-colors flex items-center gap-2 ${isProfileMenuOpen ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Olá, {user.name.split(' ')[0]}</span>
                  <svg
                    className={`ml-1 h-3 w-3 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border bg-card p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-3 border-b border-border/50 mb-1">
                      <p className="text-sm font-bold leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                      <div className="mt-2 inline-block px-2 py-0.5 bg-primary/10 rounded text-[9px] font-black uppercase tracking-widest text-primary">
                        {user.userType === 'admin' || user.userType === 'global' ? 'Administrador' : 'Membro'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => { }}
                      >
                        <SettingsIcon className="h-4 w-4 text-primary" />
                        Atualizar Dados
                      </button>

                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => { }}
                      >
                        <KeyIcon className="h-4 w-4 text-primary" />
                        Redefinir Senha
                      </button>

                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors text-left"
                        onClick={() => { }}
                      >
                        <LifeBuoyIcon className="h-4 w-4 text-primary" />
                        Suporte Técnico
                      </button>
                    </div>

                    <div className="mt-1 pt-1 border-t border-border/50">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left"
                        onClick={handleLogout}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => navigate('/login')} size="sm" className="font-bold">
                Entrar na Plataforma
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
