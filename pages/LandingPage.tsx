import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { QrCodeIcon } from '../components/icons';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm mb-4">
          <QrCodeIcon className="h-4 w-4 mr-2" />
          Compartilhamento de Mídias Simplificado
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 leading-tight">
          Colete Memórias, Não Complicações.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Crie um evento, compartilhe um QR Code e deixe que seus convidados enviem fotos e vídeos diretamente para sua galeria privada. Simples, rápido e seguro.
        </p>
        <Button size="lg" onClick={() => navigate('/login')}>
          Começar Agora
        </Button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold mb-2">1. Crie seu Evento</h3>
            <p className="text-muted-foreground">Dê um nome ao seu evento em segundos. Seja um casamento, aniversário, show ou uma conferência, nós cuidamos do resto.</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold mb-2">2. Compartilhe o QR Code</h3>
            <p className="text-muted-foreground">Cada evento gera um QR Code único. Exiba-o no local ou envie digitalmente para seus convidados.</p>
        </div>
        <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold mb-2">3. Receba as Mídias</h3>
            <p className="text-muted-foreground">Os convidados escaneiam, fazem o upload e pronto! Todas as fotos e vídeos aparecem magicamente no seu dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;