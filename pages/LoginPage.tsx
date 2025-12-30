
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
  const [birthDate, setBirthDate] = useState('');

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
    setBirthDate('');
    setName('');
    setPhone('');
    setCode('');
  };

  const calculateAge = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    const [day, month, year] = parts.map(Number);
    const birthDateObj = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
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
      let errorMessage = err.message || 'Falha no login. Verifique suas credenciais.';
      const lowMessage = errorMessage.toLowerCase();
      
      // Tratamento para e-mail não encontrado
      if (lowMessage.includes('not found') || lowMessage.includes('não encontrado')) {
        errorMessage = 'Ops! Não encontramos uma conta com esse e-mail. Que tal se cadastrar agora e começar a capturar memórias?';
      } 
      // Tratamento para senha incorreta
      else if (lowMessage.includes('password') || lowMessage.includes('senha')) {
        errorMessage = 'Sua senha parece estar incorreta. Que tal conferir os dados ou usar a opção de "Recuperar senha"?';
      }
      
      setError(errorMessage);
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
      let errorMessage = err.message || 'Não foi possível solicitar o código. Tente novamente.';
      
      if (errorMessage.toLowerCase().includes('email already registered')) {
        errorMessage = 'Este e-mail já possui um cadastro no EventSnap. Que tal tentar fazer login ou recuperar sua senha?';
      }
      
      setError(errorMessage);
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
    } catch (err: any) {
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
    } catch (err: any) {
      let errorMessage = err.message || 'Falha ao redefinir a senha. Verifique os dados.';
      if (errorMessage.toLowerCase().includes('invalid or expired code')) {
        errorMessage = 'O código de recuperação informado é inválido ou já expirou. Por favor, solicite um novo código.';
      }
      setError(errorMessage);
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

  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 8) return birthDate;
    let formatted = digits;
    if (digits.length > 2) {
      formatted = `${digits.substring(0, 2)}/${digits.substring(2)}`;
    }
    if (digits.length > 4) {
      formatted = `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4)}`;
    }
    return formatted;
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(formatBirthDate(e.target.value));
  };

  const convertToBackendDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const handleConfirmSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação de Nome Completo (Pelo menos duas palavras)
    const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0);
    if (nameParts.length < 2) {
      setError('Por favor, insira seu nome completo (nome e sobrenome).');
      return;
    }

    // Validação de Data de Nascimento Completa
    const isBirthDateComplete = birthDate.length === 10;
    if (!isBirthDateComplete) {
      setError('Por favor, informe sua data de nascimento completa no formato DD/MM/AAAA.');
      return;
    }

    // Validação de Idade Mínima
    const age = calculateAge(birthDate);
    if (age < 12) {
      setError('Você precisa ter pelo menos 12 anos de idade para criar uma conta no EventSnap.');
      return;
    }

    // Validação de Código PIN
    if (!code || code.trim().length === 0) {
      setError('O código PIN enviado para seu e-mail é obrigatório.');
      return;
    }

    // Validação de Senha
    if (!isPasswordValid) {
      setError('Sua senha não atende aos requisitos mínimos de segurança (8 caracteres, maiúscula, minúscula e número).');
      return;
    }
    
    setLoading(true);
    const phoneDigits = `55${phone.replace(/\D/g, '')}`;
    const formattedBirthDate = convertToBackendDate(birthDate);

    try {
      await authService.confirmSignup({
        email,
        password,
        code,
        name,
        phone: phoneDigits,
        dateOfBirth: formattedBirthDate,
      });
      
      // Captura o email para preencher o login
      const signedUpEmail = email;
      resetCommonState();
      setEmail(signedUpEmail);
      setSuccessMessage('Cadastro realizado com sucesso! Você já pode fazer o login.');
      setMode('login');
    } catch (err: any) {
      let errorMessage = err.message || 'Falha ao confirmar o cadastro. Verifique os dados.';
      
      // Tratamento amigável para erro de código expirado ou inválido
      if (errorMessage.toLowerCase().includes('invalid or expired code')) {
        errorMessage = 'O código informado é inválido ou já expirou. Por favor, volte ao passo anterior e solicite um novo código.';
      } else if (errorMessage.toLowerCase().includes('email already registered')) {
        errorMessage = 'Este e-mail já possui um cadastro no EventSnap. Que tal tentar fazer login ou recuperar sua senha?';
      }
      
      setError(errorMessage);
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
        {successMessage && <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md font-medium border border-green-200">{successMessage}</p>}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email-login" className="text-sm font-medium">E-mail</label>
            <Input id="email-login" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <label htmlFor="password-login" className="text-sm font-medium">Senha</label>
            <Input id="password-login" type="password" placeholder="sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setMode('forgot-password-email'); resetCommonState(); }}
                className="text-sm font-semibold text-primary hover:underline focus:outline-none"
              >
                Recuperar senha
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-destructive font-medium leading-relaxed">{error}</p>}
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
          <Input type="text" placeholder="Nome Completo (Ex: João Silva)" value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
          <Input type="text" placeholder="Data de Nascimento (DD/MM/AAAA)" value={birthDate} onChange={handleBirthDateChange} required disabled={loading} />
          <Input type="tel" placeholder="(DDD) Telefone" value={phone} onChange={handlePhoneChange} required disabled={loading} />
          <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />

          <div className="text-xs text-muted-foreground space-y-1">
            <p className={passwordValidations.minLength ? 'text-green-600' : ''}>✓ Pelo menos 8 caracteres</p>
            <p className={passwordValidations.hasUpper ? 'text-green-600' : ''}>✓ Uma letra maiúscula</p>
            <p className={passwordValidations.hasLower ? 'text-green-600' : ''}>✓ Uma letra minúscula</p>
            <p className={passwordValidations.hasNumber ? 'text-green-600' : ''}>✓ Um número</p>
          </div>

          {error && <p className="text-sm text-destructive font-medium border border-destructive/20 bg-destructive/5 p-2 rounded-md">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
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
