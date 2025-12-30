
import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../hooks/useAuth';
import { useEvents } from '../hooks/useEvents';
import { Event } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dialog from '../components/ui/Dialog';
import EventCard from '../components/EventCard';
import { PlusCircleIcon, AlertTriangleIcon } from '../components/icons';

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
  const { events, loadingEvents, createEvent, updateEvent, getMediaForEvent } = useEvents();

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [isMediaModalOpen, setMediaModalOpen] = useState(false);

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
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const [creationError, setCreationError] = useState('');

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

  useEffect(() => {
    const fetchMedia = async () => {
      if (isMediaModalOpen && selectedEvent && user) {
        setLoadingMedia(true);
        setMediaUrls([]);
        try {
          const urls = await getMediaForEvent(selectedEvent.token, user.id);
          setMediaUrls(urls);
        } catch (error) {
          console.error("Error fetching media:", error);
        } finally {
          setLoadingMedia(false);
        }
      }
    };
    fetchMedia();
  }, [isMediaModalOpen, selectedEvent, user, getMediaForEvent]);


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
    setCreationError('');
    setCreateModalOpen(true);
  };

  const handleProceedToConfirmation = () => {
    setCreationError('');
    if (!newEventName.trim() || !newEventExpiresAt) {
      setCreationError('Por favor, preencha o nome e a data de expiração.');
      return;
    }
    const selectedDate = new Date(newEventExpiresAt);
    const today = new Date(getTodayLocalDate());
    if (selectedDate <= today) {
      setCreationError('A data de expiração precisa ser posterior à data de hoje.');
      return;
    }
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
    const selectedDate = new Date(editedEventExpiresAt);
    const today = new Date(getTodayLocalDate());
    if (selectedDate <= today) {
      setEditError('A data de expiração precisa ser posterior à data de hoje.');
      return;
    }

    const payload: { name?: string; description?: string; expiresAt?: Date; eventColor?: string } = {};

    const trimmedName = editedEventName.trim();
    const trimmedDescription = editedEventDescription.trim();
    const originalDescription = editingEvent.description || '';

    if (trimmedName !== editingEvent.name) {
      payload.name = trimmedName;
    }
    if (trimmedDescription !== originalDescription) {
      payload.description = trimmedDescription;
    }
    if (editedEventColor !== (editingEvent.eventColor || '')) {
      payload.eventColor = editedEventColor;
    }

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

  const showMediaModal = (event: Event) => {
    setSelectedEvent(event);
    setMediaModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Carousel Banner Section */}
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

          {/* Color Selection - NEW POINT */}
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

          {creationError && <p className="text-sm text-destructive">{creationError}</p>}
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
          <div className="p-3 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
            <p className="font-bold">Lembrete</p>
            <p className="text-sm">
              A data de expiração define até quando os convidados podem enviar mídias. Você poderá editar todos os detalhes do evento depois.
            </p>
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
          <Button className="w-full" onClick={() => navigator.clipboard.writeText(publicEventUrl)}>
            Copiar Link
          </Button>
        </div>
      </Dialog>

      {/* View Media Modal */}
      <Dialog
        isOpen={isMediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        title={`Mídias de: ${selectedEvent?.name || ''}`}
      >
        {loadingMedia ? (
          <div className="text-center py-8">Carregando mídias...</div>
        ) : mediaUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {mediaUrls.map((url, index) => {
              const type = getMediaType(url);
              return (
                <div
                  key={index}
                  className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxImageUrl(url)}
                >
                  {type === 'image' ? (
                    <img src={url} alt={`media ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <video src={url} className="w-full h-full object-cover" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma mídia foi enviada para este evento ainda.
          </p>
        )}
      </Dialog>

      {/* Lightbox for viewing full media */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {getMediaType(lightboxImageUrl) === 'image' ? (
              <img
                src={lightboxImageUrl}
                alt="Visualização ampliada"
                className="max-w-full max-h-full object-contain"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <video
                src={lightboxImageUrl}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
                onClick={e => e.stopPropagation()}
              />
            )}
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors"
              onClick={() => setLightboxImageUrl(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              <span className="sr-only">Fechar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
