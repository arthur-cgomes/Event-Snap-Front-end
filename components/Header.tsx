import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Dialog from './ui/Dialog';
import { EventSnapLogoIcon, UserIcon, SettingsIcon, LifeBuoyIcon, KeyIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';
import { authService } from '../services/mockApi';

const Header: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { user, logout, updateUser, refreshUserProfile } = context;
  
  const navigate = useNavigate();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Form states for profile update
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Password Reset States
  const [isResetRequestModalOpen, setResetRequestModalOpen] = useState(false);
  const [isResetConfirmModalOpen, setResetConfirmModalOpen] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Success Notification States
  const [successToast, setSuccessToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

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

  // Timer for resending code
  useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = window.setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendTimer]);

  // Global Success Toast Auto-hide (5 seconds)
  useEffect(() => {
    let timer: any;
    if (successToast.show) {
      timer = setTimeout(() => {
        setSuccessToast(prev => ({ ...prev, show: false }));
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successToast.show]);

  const passwordValidations = useMemo(() => ({
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
  }), [newPassword]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  // Máscara para Telefone: (00) 00000-0000
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 11) return editPhone;
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    }
    if (digits.length > 7) {
      formatted = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    }
    return formatted;
  }

  // Máscara para Data: 00/00/0000
  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 8) return editBirthDate;
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.substring(0, 2)}/${digits.substring(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
    }
    return formatted;
  };

  const handleOpenUpdateModal = async () => {
    setProfileMenuOpen(false);
    setUpdateError('');
    setIsSubmitting(true);
    await refreshUserProfile();
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    if (user?.phone) {
      const p = user.phone.startsWith('55') ? user.phone.substring(2) : user.phone;
      setEditPhone(formatPhone(p));
    } else {
      setEditPhone('');
    }
    if (user?.dateOfBirth) {
      const date = new Date(user.dateOfBirth);
      const dd = String(date.getUTCDate()).padStart(2, '0');
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = date.getUTCFullYear();
      setEditBirthDate(`${dd}/${mm}/${yyyy}`);
    } else {
      setEditBirthDate('');
    }
    setIsSubmitting(false);
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setIsSubmitting(true);
    try {
      const nameParts = editName.trim().split(/\s+/).filter(part => part.length > 0);
      if (nameParts.length < 2) {
        throw new Error('Por favor, informe seu nome e sobrenome.');
      }
      const payload: any = {
        name: editName.trim(),
        email: editEmail.trim(),
      };
      if (editPhone) {
        payload.phone = `55${editPhone.replace(/\D/g, '')}`;
      }
      if (editBirthDate) {
        if (editBirthDate.length !== 10) {
          throw new Error('Data de nascimento deve estar no formato DD/MM/AAAA.');
        }
        const [day, month, year] = editBirthDate.split('/');
        payload.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      await updateUser(payload);
      setUpdateModalOpen(false);
      setSuccessToast({
        show: true,
        message: 'Seus dados foram atualizados com sucesso!'
      });
    } catch (err: any) {
      setUpdateError(err.message || 'Falha ao atualizar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PASSWORD RESET LOGIC ---
  const handleStartResetFlow = () => {
    setProfileMenuOpen(false);
    setResetError('');
    setResetRequestModalOpen(true);
  };

  const handleRequestResetCode = async () => {
    if (!user?.email) return;
    setIsResetLoading(true);
    setResetError('');
    try {
      await authService.requestReset(user.email);
      setResendTimer(30);
      setResetRequestModalOpen(false);
      setResetConfirmModalOpen(true);
    } catch (err: any) {
      setResetError(err.message || 'Não foi possível enviar o código. Tente novamente.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !isPasswordValid || resetCode.length < 4) return;
    
    setIsResetLoading(true);
    setResetError('');
    try {
      await authService.confirmReset({
        email: user.email,
        newPassword: newPassword,
        code: resetCode
      });
      setResetConfirmModalOpen(false);
      setResetCode('');
      setNewPassword('');
      setSuccessToast({
        show: true,
        message: 'Sua senha foi redefinida com sucesso!'
      });
    } catch (err: any) {
      setResetError(err.message || 'Código inválido ou expirado.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleSupportRedirect = () => {
    const message = encodeURIComponent("Preciso de ajuda com o EventSnap!");
    window.open(`https://wa.me/5531985171031?text=${message}`, '_blank');
  };

  return (
    <>
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
                    <span className="hidden sm:inline">Olá, {user.name.split(' ')[0]}</span>
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
                          onClick={handleOpenUpdateModal}
                        >
                          <SettingsIcon className="h-4 w-4 text-primary" />
                          Atualizar Dados
                        </button>

                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors text-left"
                          onClick={handleStartResetFlow}
                        >
                          <KeyIcon className="h-4 w-4 text-primary" />
                          Redefinir Senha
                        </button>

                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors text-left"
                          onClick={handleSupportRedirect}
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

      {/* Global Success Notification Toast */}
      {successToast.show && (
        <div className="fixed top-20 right-6 z-[150] animate-in fade-in slide-in-from-right-10 duration-500">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-500/50 backdrop-blur-md">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">Sucesso!</p>
              <p className="text-xs opacity-90">{successToast.message}</p>
            </div>
            <button 
              onClick={() => setSuccessToast(prev => ({ ...prev, show: false }))}
              className="ml-4 hover:bg-white/10 p-1 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Atualizar Dados */}
      <Dialog
        isOpen={isUpdateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title="Atualizar Meus Dados"
        size="md"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-5">
          <p className="text-xs text-muted-foreground -mt-2">
            Altere as informações abaixo e clique em salvar.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Nome Completo</label>
            <Input placeholder="Seu nome completo" value={editName} onChange={e => setEditName(e.target.value)} required disabled={isSubmitting} className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">E-mail de Acesso</label>
            <Input type="email" placeholder="seu@email.com" value={editEmail} onChange={e => setEditEmail(e.target.value)} required disabled={isSubmitting} className="h-11" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Telefone</label>
              <Input placeholder="(00) 00000-0000" value={editPhone} onChange={e => setEditPhone(formatPhone(e.target.value))} disabled={isSubmitting} className="h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Data de Nascimento</label>
              <Input placeholder="DD/MM/AAAA" value={editBirthDate} onChange={e => setEditBirthDate(formatBirthDate(e.target.value))} disabled={isSubmitting} className="h-11" />
            </div>
          </div>
          {updateError && <div className="p-3 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg border border-destructive/20">{updateError}</div>}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setUpdateModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Solicitar Código de Redefinição */}
      <Dialog
        isOpen={isResetRequestModalOpen}
        onClose={() => setResetRequestModalOpen(false)}
        title="Redefinir Senha"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enviaremos um código de verificação para o seu e-mail cadastrado: <strong>{user?.email}</strong>.
          </p>
          {resetError && <div className="p-3 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg border border-destructive/20">{resetError}</div>}
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              className="h-12 rounded-xl font-bold shadow-lg" 
              onClick={handleRequestResetCode} 
              disabled={isResetLoading}
            >
              {isResetLoading ? 'Enviando...' : 'Confirmar e Enviar Código'}
            </Button>
            <Button variant="ghost" onClick={() => setResetRequestModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Dialog>

      {/* Modal: Confirmar Código e Nova Senha */}
      <Dialog
        isOpen={isResetConfirmModalOpen}
        onClose={() => setResetConfirmModalOpen(false)}
        title="Nova Senha"
        size="md"
      >
        <form onSubmit={handleConfirmReset} className="space-y-5">
          <p className="text-sm text-muted-foreground -mt-2">
            Insira o código de 6 dígitos enviado para <strong>{user?.email}</strong> e escolha sua nova senha.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Código de Verificação</label>
            <Input 
              placeholder="000000" 
              value={resetCode} 
              onChange={e => setResetCode(e.target.value.replace(/\D/g, '').substring(0, 6))} 
              required 
              disabled={isResetLoading}
              className="h-11 text-center text-lg tracking-widest font-black"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Nova Senha</label>
            <Input 
              type="password"
              placeholder="Sua nova senha" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              disabled={isResetLoading}
              className="h-11"
            />
            <div className="text-[10px] grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-muted-foreground">
              <div className={passwordValidations.minLength ? 'text-green-600 font-bold' : ''}>• Mín. 8 caracteres</div>
              <div className={passwordValidations.hasUpper ? 'text-green-600 font-bold' : ''}>• Uma letra maiúscula</div>
              <div className={passwordValidations.hasLower ? 'text-green-600 font-bold' : ''}>• Uma letra minúscula</div>
              <div className={passwordValidations.hasNumber ? 'text-green-600 font-bold' : ''}>• Um número</div>
            </div>
          </div>

          {resetError && <div className="p-3 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg border border-destructive/20">{resetError}</div>}

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              type="submit" 
              className="h-12 rounded-xl font-bold shadow-lg" 
              disabled={isResetLoading || !isPasswordValid || resetCode.length < 4}
            >
              {isResetLoading ? 'Salvando...' : 'Atualizar Senha'}
            </Button>
            
            <div className="flex justify-center pt-2">
              <button
                type="button"
                className={`text-sm font-bold transition-colors ${resendTimer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
                disabled={resendTimer > 0 || isResetLoading}
                onClick={handleRequestResetCode}
              >
                {resendTimer > 0 ? `Reenviar código em ${resendTimer}s` : 'Não recebi o código'}
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default Header;