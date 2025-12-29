
import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { authService } from '../services/mockApi';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup-email' | 'signup-confirm' | 'forgot-password-email' | 'forgot-password-confirm'>('login');
  
  // Common state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Signup specific state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const { login } = useAuth();

  const passwordValidations = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  }), [password]);

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);

  const resetCommonState = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Atalho administrativo solicitado
    let loginEmail = email;
    let loginPassword = password;

    if (email === 'admin@admin' && password === 'admin@admin') {
      loginEmail = 'admin@eventsnap.com.br';
      loginPassword = '102030@Aa';
    }

    try {
      await login(loginEmail, loginPassword); 
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.requestSignup(email);
      setMode('signup-confirm');
    } catch (err: any) {
      setError(err.message || 'Não foi possível solicitar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRequestResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.requestReset(email);
      setMode('forgot-password-confirm');
    } catch(err: any) {
      setError(err.message || 'Não foi possível solicitar a recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
        setError('Por favor, garanta que a nova senha atende aos critérios.');
        return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.confirmReset({
        email,
        newPassword: password,
        code
      });
      setSuccessMessage('Senha redefinida com sucesso! Você já pode fazer o login.');
      setMode('login');
      setPassword('');
      setCode('');
    } catch(err: any) {
      setError(err.message || 'Falha ao redefinir a senha. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 11) return phone;
    let formatted = digits.replace(/^(\d{2})(\d)/g, '($1) $2');
    formatted = formatted.replace(/(\d{5})(\d)/, '$1-$2');
    return formatted;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };
  
  const handleConfirmSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || name.split(' ').length < 2) {
        setError('Por favor, preencha todos os campos corretamente e garanta que a senha atende aos critérios.');
        return;
    }
    setError('');
    setLoading(true);
    const phoneDigits = `55${phone.replace(/\D/g, '')}`;

    try {
      await authService.confirmSignup({
        email,
        password,
        code,
        name,
        phone: phoneDigits,
      });
      setSuccessMessage('Cadastro realizado com sucesso! Você já pode fazer o login.');
      setMode('login');
      setPassword(''); 
    } catch (err: any) {
      setError(err.message || 'Falha ao confirmar o cadastro. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderLogin = () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Acessar Plataforma</CardTitle>
        <CardDescription>Use seu e-mail e senha para continuar.</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">{successMessage}</p>}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email-login" className="text-sm font-medium">E-mail</label>
            <Input id="email-login" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label htmlFor="password-login" className="text-sm font-medium">Senha</label>
                <button 
                    type="button" 
                    onClick={() => { setMode('forgot-password-email'); resetCommonState(); }} 
                    className="text-sm font-semibold text-primary hover:underline focus:outline-none"
                >
                    Recuperar senha
                </button>
            </div>
            <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <button onClick={() => { setMode('signup-email'); resetCommonState(); }} className="font-semibold text-primary hover:underline focus:outline-none">
                Cadastre-se
            </button>
        </p>
      </CardFooter>
    </Card>
  );

  const renderSignupEmail = () => (
     <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Criar sua conta</CardTitle>
        <CardDescription>Informe seu e-mail para receber um código de verificação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestCodeSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email-signup" className="text-sm font-medium">E-mail</label>
            <Input id="email-signup" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar código'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <button onClick={() => { setMode('login'); resetCommonState(); }} className="font-semibold text-primary hover:underline focus:outline-none">
                Faça login
            </button>
        </p>
      </CardFooter>
    </Card>
  );

  const renderSignupConfirm = () => (
     <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Finalizar Cadastro</CardTitle>
          <CardDescription>Preencha seus dados. Um código foi enviado para {email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirmSignupSubmit} className="space-y-4">
            <Input id="email-confirm" type="email" value={email} disabled className="bg-muted" />
            <Input type="text" placeholder="Código PIN" value={code} onChange={e => setCode(e.target.value)} required disabled={loading} />
            <Input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
            <Input type="tel" placeholder="(DDD) Telefone" value={phone} onChange={handlePhoneChange} required disabled={loading} />
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
            
            <div className="text-xs text-muted-foreground space-y-1">
                <p className={passwordValidations.minLength ? 'text-green-600' : ''}>✓ Pelo menos 8 caracteres</p>
                <p className={passwordValidations.hasUpper ? 'text-green-600' : ''}>✓ Uma letra maiúscula</p>
                <p className={passwordValidations.hasLower ? 'text-green-600' : ''}>✓ Uma letra minúscula</p>
                <p className={passwordValidations.hasNumber ? 'text-green-600' : ''}>✓ Um número</p>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
              {loading ? 'Cadastrando...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
             <button onClick={() => { setMode('signup-email'); setError(''); }} className="text-sm font-semibold text-primary hover:underline focus:outline-none">
                Voltar para o e-mail
            </button>
        </CardFooter>
      </Card>
  );

  const renderForgotPasswordEmail = () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Recuperar Senha</CardTitle>
        <CardDescription>Informe seu e-mail para receber um código de recuperação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestResetSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email-forgot" className="text-sm font-medium">E-mail</label>
            <Input id="email-forgot" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Código'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <button onClick={() => { setMode('login'); resetCommonState(); }} className="text-sm font-semibold text-primary hover:underline focus:outline-none">
            Voltar para o login
        </button>
      </CardFooter>
    </Card>
  );

  const renderForgotPasswordConfirm = () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Definir Nova Senha</CardTitle>
        <CardDescription>Um código foi enviado para {email}. Insira-o abaixo com sua nova senha.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConfirmResetSubmit} className="space-y-4">
          <Input type="email" value={email} disabled className="bg-muted" />
          <Input type="text" placeholder="Código PIN" value={code} onChange={e => setCode(e.target.value)} required disabled={loading} />
          <Input type="password" placeholder="Nova Senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />

          <div className="text-xs text-muted-foreground space-y-1">
              <p className={passwordValidations.minLength ? 'text-green-600' : ''}>✓ Pelo menos 8 caracteres</p>
              <p className={passwordValidations.hasUpper ? 'text-green-600' : ''}>✓ Uma letra maiúscula</p>
              <p className={passwordValidations.hasLower ? 'text-green-600' : ''}>✓ Uma letra minúscula</p>
              <p className={passwordValidations.hasNumber ? 'text-green-600' : ''}>✓ Um número</p>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !isPasswordValid}>
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </form>
      </CardContent>
        <CardFooter className="flex justify-center">
            <button onClick={() => { setMode('forgot-password-email'); setError(''); setCode(''); setPassword(''); }} className="text-sm font-semibold text-primary hover:underline focus:outline-none">
                Voltar para o e-mail
            </button>
        </CardFooter>
    </Card>
  );


  return (
    <div className="flex items-center justify-center py-12 px-4">
      {mode === 'login' && renderLogin()}
      {mode === 'signup-email' && renderSignupEmail()}
      {mode === 'signup-confirm' && renderSignupConfirm()}
      {mode === 'forgot-password-email' && renderForgotPasswordEmail()}
      {mode === 'forgot-password-confirm' && renderForgotPasswordConfirm()}
    </div>
  );
};

export default LoginPage;
