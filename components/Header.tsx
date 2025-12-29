import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';
import { EventSnapLogoIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      {/* ALTERAÇÃO AQUI:
         1. Removi 'container' (que limitava a largura).
         2. Adicionei 'px-8' (para dar o espaçamento das bordas que você queria).
         3. Garanti 'justify-between' e 'w-full'.
      */}
      <div className="flex h-16 w-full items-center justify-between px-8">
        
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <EventSnapLogoIcon className="h-6 w-6" />
            <span className="inline-block font-bold">EventSnap</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                  Olá, {user.name}
                </span>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  Sair
                </Button>
              </>
            ) : (
                <Button onClick={() => navigate('/login')} size="sm">
                  Entrar
                </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;