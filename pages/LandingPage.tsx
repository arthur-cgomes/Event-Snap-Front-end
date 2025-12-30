
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { QrCodeIcon, UserCheckIcon, UploadCloudIcon, MessageCircleIcon, CalendarIcon, PartyPopperIcon } from '../components/icons';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm mb-6 font-medium">
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Compartilhamento de Mídias Simplificado
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1] text-foreground">
            Colete Memórias, <span className="text-primary">Não Complicações.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Crie um evento, compartilhe um QR Code e deixe que seus convidados enviem fotos e vídeos diretamente para sua galeria privada. Sem downloads, sem estresse.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-xl" onClick={() => navigate('/login')}>
              Começar Agora — É Grátis
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-xl" onClick={() => {
              const element = document.getElementById('pricing');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Ver Preços
            </Button>
          </div>
        </div>

        {/* 3 Steps Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-8 border rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all border-border/50 group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Crie seu Evento</h3>
            <p className="text-muted-foreground leading-relaxed">Dê um nome ao seu evento em segundos. Seja um casamento, aniversário ou show, nós cuidamos do resto.</p>
          </div>
          <div className="p-8 border rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all border-border/50 group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <QrCodeIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Compartilhe o QR Code</h3>
            <p className="text-muted-foreground leading-relaxed">Cada evento gera um QR Code único. Exiba-o no local ou envie digitalmente para seus convidados.</p>
          </div>
          <div className="p-8 border rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all border-border/50 group">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <UploadCloudIcon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Receba as Mídias</h3>
            <p className="text-muted-foreground leading-relaxed">Os convidados escaneiam e fazem o upload. Todas as fotos e vídeos aparecem no seu dashboard.</p>
          </div>
        </div>
      </div>

      {/* Commercial Value Section */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Por que o EventSnap é perfeito para você?</h2>
            <p className="text-lg text-muted-foreground">Esqueça a bagunça de pedir fotos por WhatsApp ou links expirados de nuvem.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <UserCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Sem Aplicativos ou Cadastros</h4>
                  <p className="text-muted-foreground">Seus convidados não precisam baixar nada nem criar conta. É só escanear e enviar. Praticidade total para todas as idades.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <MessageCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Privacidade Garantida</h4>
                  <p className="text-muted-foreground">Diferente das redes sociais, sua galeria é privada. Só você (o dono do evento) tem acesso total às fotos originais.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <UploadCloudIcon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Qualidade Original</h4>
                  <p className="text-muted-foreground">O WhatsApp destrói a qualidade das fotos. No EventSnap, você recebe os arquivos na resolução que foram tirados.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl border border-primary/20 flex items-center justify-center overflow-hidden">
                <QrCodeIcon className="w-1/2 h-1/2 text-primary opacity-20 absolute" />
                <div className="relative z-10 p-8 text-center">
                  <PartyPopperIcon className="w-24 h-24 text-primary mx-auto mb-6" />
                  <p className="text-2xl font-black leading-tight italic">"A melhor forma de capturar os bastidores que o fotógrafo oficial não vê."</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Planos Simples e Transparentes</h2>
          <p className="text-lg text-muted-foreground">Escolha o plano ideal para o tamanho da sua comemoração.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-3xl border bg-card flex flex-col hover:border-primary/30 transition-colors">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Gratuito</h3>
              <p className="text-muted-foreground">Para pequenos momentos.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black">R$ 0</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm">1 QR Code Ativo</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm font-bold text-primary">Limite de 10 Uploads</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm">Download das mídias</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                <span className="text-sm">Validade de apenas 24h</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full h-12 font-bold rounded-xl" onClick={() => navigate('/login')}>
              Criar Grátis
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="p-8 rounded-3xl border-2 border-primary bg-card flex flex-col relative overflow-hidden shadow-2xl shadow-primary/10">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-black uppercase tracking-widest rounded-bl-xl">
              Mais Popular
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Evento Premium</h3>
              <p className="text-muted-foreground">Para casamentos e grandes festas.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm font-bold text-muted-foreground">R$</span>
                <span className="text-5xl font-black text-primary">49,90</span>
                <span className="text-sm font-bold text-muted-foreground">/evento</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm font-bold">Uploads ILIMITADOS</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm font-bold">QR Code de alta resolução</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm font-bold">Validade de até 30 dias</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                <span className="text-sm">Suporte Prioritário</span>
              </li>
            </ul>
            <Button className="w-full h-12 font-bold rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/login')}>
              Contratar Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Pronto para começar seu evento?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">Junte-se a milhares de anfitriões que estão capturando todos os ângulos das suas festas.</p>
          <Button variant="secondary" size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl hover:scale-105 transition-transform" onClick={() => navigate('/login')}>
            Criar meu primeiro QR Code agora
          </Button>
        </div>
      </div>

      {/* Footer Simple */}
      <footer className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="h-6 w-6 text-primary" />
            <span className="font-black text-xl tracking-tight">EventSnap</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 EventSnap. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
