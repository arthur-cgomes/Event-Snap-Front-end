
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Event } from '../types';
import { useEvents } from '../hooks/useEvents';
import FileUpload from '../components/FileUpload';
import Button from '../components/ui/Button';
import { PartyPopperIcon, EventSnapLogoIcon } from '../components/icons';

interface MediaPreview {
  url: string;
  type: string;
  name: string;
  size: number;
  file: File;
}

const PublicUploadPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { getEventById, addMediaToEvent } = useEvents();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  // Estado para múltiplos arquivos
  const [previews, setPreviews] = useState<MediaPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        setLoading(true);
        const foundEvent = await getEventById(eventId);
        setEvent(foundEvent);
        if (foundEvent && new Date() > new Date(foundEvent.expiresAt)) {
          setIsExpired(true);
        }
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, getEventById]);

  // Limpeza de URLs para evitar memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setUploadError('');

    // Filtra e limita a 15 arquivos no total (novos + já selecionados)
    const availableSlots = 15 - previews.length;
    if (availableSlots <= 0) {
      setUploadError('Limite de 15 arquivos atingido.');
      return;
    }

    const filesToProcess = selectedFiles.slice(0, availableSlots);
    const newPreviews = filesToProcess.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      size: file.size,
      file: file
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setPreviews(prev => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadQueue = async () => {
    if (previews.length === 0 || !event || !event.token) return;

    setUploading(true);
    setUploadError('');

    try {
      // Processamento sequencial: um por um
      for (let i = 0; i < previews.length; i++) {
        setCurrentUploadIndex(i);
        const item = previews[i];
        await addMediaToEvent(event.token, item.file);
      }

      setUploadSuccess(true);
    } catch (err: any) {
      let errorMessage = err.message || 'Ocorreu um erro durante o envio de um dos arquivos. Verifique sua conexão.';
      
      // Tratamento amigável para limite de QR Code gratuito atingido
      if (errorMessage.toLowerCase().includes('upload limit reached for free qr code')) {
        errorMessage = 'Ops! Este evento atingiu o limite de envios do plano gratuito. Entre em contato com o organizador para que ele possa fazer o upgrade para o plano Premium e liberar mais espaço para suas memórias!';
      }
      
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      setCurrentUploadIndex(null);
    }
  };

  const reset = () => {
    previews.forEach(p => URL.revokeObjectURL(p.url));
    setPreviews([]);
    setUploadSuccess(false);
    setUploadError('');
    setCurrentUploadIndex(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen animate-pulse">
        <EventSnapLogoIcon className="h-12 w-12 mb-4 text-primary" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Carregando Evento</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <svg className="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h1 className="text-2xl font-black">Evento não encontrado</h1>
        <p className="text-muted-foreground mt-2">O link pode estar quebrado ou o evento expirou.</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-6">
        <div className="bg-amber-100 p-4 rounded-full mb-4">
          <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 className="text-2xl font-black">Evento Encerrado</h1>
        <p className="text-muted-foreground mt-2">Este evento já não aceita mais novos envios.</p>
      </div>
    );
  }

  const bgColor = event.eventColor || '#f8fafc';

  if (uploadSuccess) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-6" style={{ backgroundColor: bgColor }}>
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-primary/10 animate-in zoom-in-95 duration-300">
          <div className="relative inline-block mb-6">
            <PartyPopperIcon className="h-20 w-20 text-primary" />
            <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
          </div>
          <h1 className="text-3xl font-black text-foreground">Enviado!</h1>
          <p className="text-muted-foreground mt-3 mb-8 text-lg">
            Todas as {previews.length} mídias foram salvas no evento <span className="text-primary font-bold">"{event.name}"</span>.
          </p>
          <Button onClick={reset} size="lg" className="w-full rounded-2xl h-14 text-lg font-bold">
            Enviar mais fotos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
      {/* Fix: Always render a hidden input that is controlled by a ref to ensure 'Add more' works regardless of conditional UI rendering */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelect(Array.from(e.target.files));
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }}
        accept="image/*,video/*"
        disabled={uploading}
        multiple
      />

      {/* Header */}
      <div className="w-full max-w-lg mx-auto pt-6 pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <EventSnapLogoIcon className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight text-muted-foreground uppercase text-xs">EventSnap</span>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold text-muted-foreground">Compartilhando em:</h1>
          <p className="text-3xl font-black text-foreground truncate px-4">{event.name}</p>
        </div>
      </div>

      <div className="w-full max-w-lg mx-auto flex-grow flex flex-col">
        {previews.length === 0 ? (
          <div className="flex-grow flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FileUpload onFileUpload={handleFilesSelect} uploading={uploading} />
          </div>
        ) : (
          <div className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">

            <div className="flex justify-between items-end px-2">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mídias Selecionadas ({previews.length}/15)</h2>
              {previews.length < 15 && !uploading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Adicionar mais
                </button>
              )}
            </div>

            {/* Grid de Previews */}
            <div className="grid grid-cols-3 gap-3">
              {previews.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-2xl overflow-hidden bg-white shadow-md border-2 ${currentUploadIndex === idx ? 'border-primary animate-pulse' : 'border-transparent'}`}
                >
                  {item.type.startsWith('video/') ? (
                    <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover" alt="preview" />
                  )}

                  {!uploading && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 backdrop-blur-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}

                  {currentUploadIndex !== null && idx < currentUploadIndex && (
                    <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                  )}

                  {currentUploadIndex === idx && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {uploadError && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-2xl border border-destructive/20 text-center leading-relaxed">
                {uploadError}
              </div>
            )}

            <div className="flex flex-col gap-3 sticky bottom-4">
              <Button
                className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
                onClick={handleUploadQueue}
                disabled={uploading}
              >
                {uploading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando {currentUploadIndex !== null ? currentUploadIndex + 1 : 0} de {previews.length}...
                  </div>
                ) : `Enviar ${previews.length} ${previews.length === 1 ? 'mídia' : 'mídias'}`}
              </Button>

              {!uploading && (
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-2xl font-bold text-muted-foreground"
                  onClick={reset}
                >
                  Limpar seleção
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center pb-8 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Powered by</span>
          <span className="text-[10px] font-black text-primary uppercase">EventSnap</span>
        </div>
      </footer>

      {/* Upload Overlay */}
      {uploading && (
        <div className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border flex flex-col items-center max-w-xs w-full animate-in zoom-in-90">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <EventSnapLogoIcon className="h-6 w-6 text-primary/50" />
              </div>
            </div>
            <p className="text-xl font-black text-foreground">Enviando memórias...</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">Arquivo {currentUploadIndex !== null ? currentUploadIndex + 1 : 0} de {previews.length}</p>

            {/* Progress Bar Simple */}
            <div className="w-full bg-muted h-2 rounded-full mt-6 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${((currentUploadIndex || 0) / previews.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicUploadPage;
