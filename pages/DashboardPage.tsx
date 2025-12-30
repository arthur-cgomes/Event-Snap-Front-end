
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import JSZip from 'jszip';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dialog from '../components/ui/Dialog';
import EventCard from '../components/EventCard';
import { PlusCircleIcon, AlertTriangleIcon, TrashIcon, DownloadIcon, Share2Icon } from '../components/icons';

const getTodayLocalDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getMediaType = (url: string) => {
  try {
    const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
    const urlPath = new URL(url).pathname.toLowerCase();
    for (const ext of videoExtensions) {
      if (urlPath.endsWith(ext)) {
        return 'video';
      }
    }
    return 'image';
  } catch (e) {
    return 'image';
  }
};

const CarouselBanner: React.FC = () => {
  const slides = [
    {
      title: "Bem-vindo ao EventSnap",
      description: "Capture cada momento especial do seu evento de forma simples e organizada.",
      bg: "bg-gradient-to-r from-primary/80 to-primary",
      cta: "Saiba mais"
    },
    {
      title: "Crie Momentos Inesquecíveis",
      description: "Seus convidados enviam as mídias, você gerencia tudo em um só lugar.",
      bg: "bg-gradient-to-r from-blue-600 to-indigo-700",
      cta: "Ver Dicas"
    },
    {
      title: "Novidades em Breve!",
      description: "Estamos preparando novas funcionalidades para tornar sua experiência ainda melhor.",
      bg: "bg-gradient-to-r from-emerald-500 to-teal-600",
      cta: "Explorar"
    }
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full h-48 md:h-64 mb-10 overflow-hidden rounded-xl shadow-lg group">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`min-w-full h-full flex flex-col justify-center px-8 md:px-16 text-white ${slide.bg}`}
          >
            <h2 className="text-2xl md:text-4xl font-black mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
              {slide.title}
            </h2>
            <p className="text-sm md:text-lg opacity-90 max-w-xl mb-4 animate-in fade-in slide-in-from-left-6 duration-700">
              {slide.description}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-fit font-bold hover:scale-105 transition-transform"
            >
              {slide.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${current === idx ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { events, loadingEvents, createEvent, updateEvent, getMediaForEvent, deleteMedia } = useEvents();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [isMediaModalOpen, setMediaModalOpen] = useState(false);
  const [isDeleteMediaModalOpen, setDeleteMediaModalOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEventName, setNewEventName] = useState('');
  const [newEventExpiresAt, setNewEventExpiresAt] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventColor, setNewEventColor] = useState('');

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editedEventName, setEditedEventName] = useState('');
  const [editedEventDescription, setEditedEventDescription] = useState('');
  const [editedEventExpiresAt, setEditedEventExpiresAt] = useState('');
  const [editedEventColor, setEditedEventColor] = useState('');
  const [editError, setEditError] = useState('');

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedMediaIndices, setSelectedMediaIndices] = useState<Set<number>>(new Set());
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  const presetColors = [
    { name: 'Padrão', value: '' },
    { name: 'Slate', value: '#f8fafc' },
    { name: 'Teal', value: '#f0fdfa' },
    { name: 'Rose', value: '#fff1f2' },
    { name: 'Indigo', value: '#eef2ff' },
    { name: 'Amber', value: '#fffbeb' },
    { name: 'Emerald', value: '#ecfdf5' },
    { name: 'Cyan', value: '#ecfeff' },
  ];

  const fetchMedia = useCallback(async () => {
    if (isMediaModalOpen && selectedEvent && user) {
      setLoadingMedia(true);
      setMediaUrls([]);
      setSelectedMediaIndices(new Set());
      try {
        const urls = await getMediaForEvent(selectedEvent.token, user.id);
        setMediaUrls(urls);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoadingMedia(false);
      }
    }
  }, [isMediaModalOpen, selectedEvent, user, getMediaForEvent]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') handleNextMedia();
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, mediaUrls]);


  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset).toLocaleDateString('pt-BR');
  };

  const handleOpenCreateModal = () => {
    setNewEventName('');
    setNewEventExpiresAt('');
    setNewEventDescription('');
    setNewEventColor('');
    setCreateModalOpen(true);
  };

  const handleProceedToConfirmation = () => {
    if (!newEventName.trim() || !newEventExpiresAt) return;
    setCreateModalOpen(false);
    setConfirmationModalOpen(true);
  };

  const handleConfirmAndCreateEvent = async () => {
    if (user && newEventName.trim() && newEventExpiresAt) {
      const date = new Date(newEventExpiresAt);
      const offset = date.getTimezoneOffset() * 60000;
      const expiryDate = new Date(date.getTime() + offset);
      expiryDate.setHours(23, 59, 59, 999);

      await createEvent(newEventName.trim(), expiryDate, newEventDescription.trim(), newEventColor);

      setConfirmationModalOpen(false);
      setNewEventName('');
      setNewEventExpiresAt('');
      setNewEventDescription('');
      setNewEventColor('');
    }
  };

  const handleCancelCreation = () => {
    setConfirmationModalOpen(false);
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setEditingEvent(event);
    setEditedEventName(event.name);
    setEditedEventDescription(event.description || '');
    setEditedEventExpiresAt(new Date(event.expiresAt).toLocaleDateString('fr-CA'));
    setEditedEventColor(event.eventColor || '');
    setEditError('');
    setEditModalOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    setEditError('');
    if (!editedEventName.trim()) {
      setEditError('O nome do evento é obrigatório.');
      return;
    }

    const payload: { name?: string; description?: string; expiresAt?: Date; eventColor?: string } = {};
    if (editedEventName.trim() !== editingEvent.name) payload.name = editedEventName.trim();
    if (editedEventDescription.trim() !== (editingEvent.description || '')) payload.description = editedEventDescription.trim();
    if (editedEventColor !== (editingEvent.eventColor || '')) payload.eventColor = editedEventColor;

    const originalDateString = new Date(editingEvent.expiresAt).toLocaleDateString('fr-CA');
    if (editedEventExpiresAt !== originalDateString) {
      const date = new Date(editedEventExpiresAt);
      const offset = date.getTimezoneOffset() * 60000;
      const expiryDate = new Date(date.getTime() + offset);
      expiryDate.setHours(23, 59, 59, 999);
      payload.expiresAt = expiryDate;
    }

    if (Object.keys(payload).length > 0) {
      try {
        await updateEvent(editingEvent.id, payload);
      } catch (error: any) {
        setEditError(error.message || 'Falha ao atualizar o evento.');
        return;
      }
    }

    setEditModalOpen(false);
    setEditingEvent(null);
  };

  const publicEventUrl = selectedEvent
    ? `${window.location.origin}/#/event/${selectedEvent.id}`
    : '';

  const showQrModal = (event: Event) => {
    setSelectedEvent(event);
    setQrModalOpen(true);
  };

  const handleNativeShare = async () => {
    if (isSharing) return;

    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: `EventSnap - ${selectedEvent?.name}`,
          text: `Acesse o evento "${selectedEvent?.name}" e envie suas fotos e vídeos!`,
          url: publicEventUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
          console.error('Error sharing:', error);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      navigator.clipboard.writeText(publicEventUrl);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedMediaIndices.size === 0 || !selectedEvent) return;
    
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(selectedEvent.name);
      
      const indices = Array.from(selectedMediaIndices);
      const downloadPromises = indices.map(async (idx) => {
        const url = mediaUrls[idx];
        const response = await fetch(url);
        const blob = await response.blob();
        
        const urlObj = new URL(url);
        const fileName = urlObj.pathname.split('/').pop() || `media_${idx}.${blob.type.split('/')[1]}`;
        
        folder?.file(fileName, blob);
      });

      await Promise.all(downloadPromises);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${selectedEvent.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Erro ao gerar ZIP:", error);
      alert("Houve um erro ao processar o download. Verifique sua conexão.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedMediaIndices.size === 0) return;
    
    setIsDeletingMedia(true);
    const urlsToDelete = Array.from(selectedMediaIndices).map(idx => mediaUrls[idx]);
    
    try {
      // O método deleteMedia lida com o corpo { urls: [...] } conforme configurado no serviço
      await deleteMedia(urlsToDelete);
      setDeleteMediaModalOpen(false);
      setSelectedMediaIndices(new Set());
      // Recarregar a lista de mídias
      await fetchMedia();
    } catch (error) {
      console.error("Erro ao deletar mídias:", error);
      alert("Houve um erro ao tentar excluir as mídias selecionadas.");
    } finally {
      setIsDeletingMedia(false);
    }
  };

  const showMediaModal = (event: Event) => {
    setSelectedEvent(event);
    setMediaModalOpen(true);
  };

  const toggleMediaSelection = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMediaIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSelectAllMedia = () => {
    if (selectedMediaIndices.size === mediaUrls.length) {
      setSelectedMediaIndices(new Set());
    } else {
      setSelectedMediaIndices(new Set(mediaUrls.map((_, i) => i)));
    }
  };

  const handleNextMedia = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % mediaUrls.length);
  };

  const handlePrevMedia = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + mediaUrls.length) % mediaUrls.length);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CarouselBanner />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Seus Eventos</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e veja as mídias enviadas.</p>
        </div>
        <Button onClick={handleOpenCreateModal}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Criar Evento
        </Button>
      </div>

      {loadingEvents ? (
        <p>Carregando eventos...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">Nenhum evento criado ainda</h2>
          <p className="text-muted-foreground mt-2 mb-4">
            Clique em "Criar Evento" para começar a coletar memórias.
          </p>
          <Button onClick={handleOpenCreateModal}>Criar meu primeiro evento</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onShowQr={showQrModal}
              onViewMedia={showMediaModal}
              onEditName={handleOpenEditModal}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Novo Evento"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground -mt-2">
            Dê um nome e defina uma data de expiração para seu evento.
          </p>
          <div className="space-y-2">
            <label htmlFor="event-name" className="text-sm font-medium">
              Nome do Evento
            </label>
            <Input
              id="event-name"
              placeholder="Ex: Aniversário da Maria"
              value={newEventName}
              onChange={e => setNewEventName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="event-description" className="text-sm font-medium">
              Descrição do Evento
            </label>
            <Input
              id="event-description"
              placeholder="Ex: Aniversário surpresa da Maria"
              value={newEventDescription}
              onChange={e => setNewEventDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="event-expires" className="text-sm font-medium">
              Data de Expiração
            </label>
            <Input
              id="event-expires"
              type="date"
              value={newEventExpiresAt}
              onChange={e => setNewEventExpiresAt(e.target.value)}
              min={getTodayLocalDate()}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Cor de Fundo da Página</label>
              <div className="group relative">
                <AlertTriangleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-card border text-card-foreground text-[10px] p-2 rounded shadow-xl z-50">
                  Esta cor será o fundo da página onde seus convidados farão o upload das mídias.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewEventColor(color.value)}
                  className={`h-8 w-full rounded-md border-2 transition-all ${newEventColor === color.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:border-muted-foreground/30'}`}
                  style={{ backgroundColor: color.value || 'white' }}
                  title={color.name}
                >
                  {!color.value && (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="w-full h-[1px] bg-red-400 rotate-45"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground italic">Opcional. Se não escolher, usaremos a cor padrão.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleProceedToConfirmation}>Continuar</Button>
        </div>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog
        isOpen={isConfirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        title="Confirmar Criação"
      >
        <div className="space-y-4">
          <p>
            Por favor, confirme os detalhes abaixo.
            <br />
            O evento será criado com as seguintes informações:
          </p>
          <div className="p-4 bg-muted rounded-lg border space-y-2">
            <p>
              <strong className="font-medium">Nome:</strong> {newEventName}
            </p>
            {newEventDescription && (
              <p>
                <strong className="font-medium">Descrição:</strong> {newEventDescription}
              </p>
            )}
            <p>
              <strong className="font-medium">Data de Expiração:</strong>{' '}
              {formatDateForDisplay(newEventExpiresAt)}
            </p>
            {newEventColor && (
              <div className="flex items-center gap-2">
                <strong className="font-medium">Cor de Fundo:</strong>
                <div className="w-4 h-4 rounded border shadow-sm" style={{ backgroundColor: newEventColor }}></div>
                <span className="text-xs text-muted-foreground uppercase">{newEventColor}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="ghost" onClick={handleCancelCreation}>
            Voltar e Editar
          </Button>
          <Button onClick={handleConfirmAndCreateEvent}>Confirmar e Criar</Button>
        </div>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Evento"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="edit-event-name" className="text-sm font-medium">
              Nome do Evento
            </label>
            <Input
              id="edit-event-name"
              value={editedEventName}
              onChange={e => setEditedEventName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-event-description" className="text-sm font-medium">
              Descrição do Evento
            </label>
            <Input
              id="edit-event-description"
              placeholder="Ex: Festa surpresa da Raquel"
              value={editedEventDescription}
              onChange={e => setEditedEventDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-event-expires" className="text-sm font-medium">
              Data de Expiração
            </label>
            <Input
              id="edit-event-expires"
              type="date"
              value={editedEventExpiresAt}
              onChange={e => setEditedEventExpiresAt(e.target.value)}
              min={getTodayLocalDate()}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor de Fundo da Página</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setEditedEventColor(color.value)}
                  className={`h-8 w-full rounded-md border-2 transition-all ${editedEventColor === color.value ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:border-muted-foreground/30'}`}
                  style={{ backgroundColor: color.value || 'white' }}
                  title={color.name}
                >
                  {!color.value && (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="w-full h-[1px] bg-red-400 rotate-45"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          {editError && <p className="text-sm text-destructive">{editError}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateEvent}>Salvar Alterações</Button>
        </div>
      </Dialog>

      {/* Show QR Code Modal */}
      <Dialog
        isOpen={isQrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={`QR Code para: ${selectedEvent?.name || ''}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <QRCodeSVG value={publicEventUrl} size={256} level="H" />
          </div>
          <p className="text-sm text-muted-foreground">
            Compartilhe este QR Code com seus convidados.
          </p>
          <Input readOnly value={publicEventUrl} />
          <div className="flex gap-2 w-full">
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={() => navigator.clipboard.writeText(publicEventUrl)}
              disabled={isSharing}
            >
              Copiar Link
            </Button>
            <Button 
              className="flex-1 font-bold" 
              onClick={handleNativeShare}
              disabled={isSharing}
            >
              <Share2Icon className="mr-2 h-4 w-4" />
              {isSharing ? 'Abrindo...' : 'Compartilhar'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* View Media Modal */}
      <Dialog
        isOpen={isMediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        title={`Mídias de: ${selectedEvent?.name || ''}`}
        size="lg"
      >
        {loadingMedia ? (
          <div className="text-center py-8">Carregando mídias...</div>
        ) : mediaUrls.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end px-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectAllMedia}
                className="text-xs font-bold text-primary hover:bg-primary/5"
              >
                {selectedMediaIndices.size === mediaUrls.length ? 'Desmarcar tudo' : 'Selecionar tudo'}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {mediaUrls.map((url, index) => {
                const type = getMediaType(url);
                const isSelected = selectedMediaIndices.has(index);
                return (
                  <div
                    key={index}
                    className={`group relative aspect-square bg-muted rounded-xl overflow-hidden cursor-pointer transition-all border-4 ${isSelected ? 'border-primary scale-95 shadow-lg' : 'border-transparent hover:border-primary/30'}`}
                    onClick={() => setLightboxIndex(index)}
                  >
                    {/* Selection Checkbox Overlay */}
                    <div 
                      className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100 border-primary' : 'opacity-0 group-hover:opacity-100 border-muted-foreground'}`}
                      onClick={(e) => toggleMediaSelection(index, e)}
                    >
                      {isSelected && <div className="w-3 h-3 bg-primary rounded-full animate-in zoom-in-50"></div>}
                    </div>

                    {/* Thumbnail */}
                    <div className={`w-full h-full ${isSelected ? 'opacity-60' : 'opacity-100'}`}>
                      {type === 'image' ? (
                        <img src={url} alt={`media ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full relative">
                          <video src={url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma mídia foi enviada para este evento ainda.
          </p>
        )}

        {/* Floating Action Menu for Selections */}
        {selectedMediaIndices.size > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center gap-4 bg-card/90 backdrop-blur-md border border-border shadow-2xl px-6 py-3 rounded-full ring-1 ring-black/5">
              <span className="text-sm font-bold text-primary px-3 border-r pr-6 border-border/50">
                {selectedMediaIndices.size} selecionados
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-destructive hover:bg-destructive/10 font-bold flex items-center gap-2"
                  onClick={() => setDeleteMediaModalOpen(true)} 
                >
                  <TrashIcon className="h-4 w-4" />
                  Apagar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-primary hover:bg-primary/10 font-bold flex items-center gap-2"
                  onClick={handleDownloadSelected}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="h-4 w-4" />
                      Baixar
                    </>
                  )}
                </Button>
                <button 
                   onClick={() => setSelectedMediaIndices(new Set())}
                   className="ml-2 p-1 hover:bg-accent rounded-full text-muted-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal de Confirmação de Deleção de Mídias */}
      <Dialog
        isOpen={isDeleteMediaModalOpen}
        onClose={() => setDeleteMediaModalOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 flex gap-3">
             <AlertTriangleIcon className="h-6 w-6 text-destructive shrink-0" />
             <div>
                <p className="font-bold text-destructive">Atenção!</p>
                <p className="text-sm">Você está prestes a excluir <span className="font-black">{selectedMediaIndices.size}</span> mídias permanentemente.</p>
             </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta ação não pode ser desfeita. Após a exclusão, os arquivos serão removidos definitivamente do servidor.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="ghost" onClick={() => setDeleteMediaModalOpen(false)} disabled={isDeletingMedia}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteSelected} 
            disabled={isDeletingMedia}
            className="font-bold"
          >
            {isDeletingMedia ? 'Excluindo...' : 'Sim, apagar permanentemente'}
          </Button>
        </div>
      </Dialog>

      {/* Lightbox for viewing full media with navigation */}
      {lightboxIndex !== null && mediaUrls[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Previous Button */}
          <button 
            className="absolute left-4 z-[210] p-4 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 hidden md:block"
            onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>

          {/* Media Content */}
          <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center p-4">
            {getMediaType(mediaUrls[lightboxIndex]) === 'image' ? (
              <img
                src={mediaUrls[lightboxIndex]}
                alt="Visualização ampliada"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <video
                src={mediaUrls[lightboxIndex]}
                controls
                autoPlay
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
              />
            )}
            
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors z-[220]"
              onClick={() => setLightboxIndex(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Pagination Label */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-bold border border-white/10">
              {lightboxIndex + 1} / {mediaUrls.length}
            </div>
          </div>

          {/* Next Button */}
          <button 
            className="absolute right-4 z-[210] p-4 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10 hidden md:block"
            onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
