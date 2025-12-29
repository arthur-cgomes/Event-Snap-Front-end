
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Event } from '../types';
import { useEvents } from '../hooks/useEvents';
import FileUpload from '../components/FileUpload';
import Button from '../components/ui/Button';
import { PartyPopperIcon, EventSnapLogoIcon } from '../components/icons';

const PublicUploadPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { getEventById, addMediaToEvent } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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

  // Limpar previewUrl para evitar memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (file && event && event.token) {
      setUploading(true);
      setUploadError('');
      try {
        await addMediaToEvent(event.token, file);
        setUploadSuccess(true);
      } catch (err: any) {
        setUploadError(err.message || 'Falha no envio. Tente novamente.');
      } finally {
        setUploading(false);
      }
    } else {
      setUploadError('Erro: Informações do evento inválidas.');
    }
  };

  const reset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadSuccess(false);
    setUploadError('');
  }

  const isVideo = file?.type.startsWith('video/');

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

  if (uploadSuccess) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-primary/10 animate-in zoom-in-95 duration-300">
          <div className="relative inline-block mb-6">
            <PartyPopperIcon className="h-20 w-20 text-primary" />
            <div className="absolute -top-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
          </div>
          <h1 className="text-3xl font-black text-foreground">Enviado com Sucesso!</h1>
          <p className="text-muted-foreground mt-3 mb-8 text-lg">
            Sua memória foi salva no evento <span className="text-primary font-bold">"{event.name}"</span>.
          </p>
          <Button onClick={reset} size="lg" className="w-full rounded-2xl h-14 text-lg font-bold">
            Enviar outra mídia
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-slate-50">
      {/* Header Fixo */}
      <div className="w-full max-w-lg mx-auto pt-6 pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
            <EventSnapLogoIcon className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight text-muted-foreground uppercase text-xs">EventSnap</span>
        </div>
        <div className="text-center">
            <h1 className="text-sm font-bold text-muted-foreground">Enviando para o evento:</h1>
            <p className="text-3xl font-black text-foreground truncate px-4">{event.name}</p>
        </div>
      </div>

      <div className="w-full max-w-lg mx-auto flex-grow flex flex-col justify-center">
        {!file ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FileUpload onFileUpload={handleFileSelect} uploading={uploading} />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Media Preview Card */}
            <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl border border-primary/10 relative">
              {previewUrl && (
                <div className="aspect-square w-full">
                  {isVideo ? (
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-cover" 
                      controls={false}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                  {/* Tag indicativa */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-full">
                    {isVideo ? 'Vídeo' : 'Foto'}
                  </div>
                </div>
              )}
              
              <div className="p-4 bg-white">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Arquivo selecionado</p>
                <p className="font-bold text-foreground truncate">{file.name}</p>
                <p className="text-xs text-primary font-bold">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {uploadError && (
                <div className="p-4 bg-destructive/10 text-destructive text-sm font-bold rounded-2xl border border-destructive/20 text-center animate-shake">
                    {uploadError}
                </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20" 
                onClick={handleUpload} 
                disabled={uploading}
              >
                {uploading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando Memória...
                  </div>
                ) : 'Confirmar e Enviar'}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-2xl font-bold text-muted-foreground" 
                onClick={() => setFile(null)} 
                disabled={uploading}
              >
                Escolher outra foto
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer minimalista */}
      <footer className="text-center pb-8 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border rounded-full shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Powered by</span>
            <span className="text-[10px] font-black text-primary uppercase">EventSnap</span>
        </div>
      </footer>

      {/* Overlay global de upload para feedback pesado se necessário */}
      {uploading && (
          <div className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-3xl shadow-2xl border flex flex-col items-center max-w-xs w-full animate-in zoom-in-90">
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <EventSnapLogoIcon className="h-6 w-6 text-primary/50" />
                    </div>
                </div>
                <p className="text-xl font-black text-foreground">Sua mídia está subindo!</p>
                <p className="text-sm text-muted-foreground mt-1 text-center">Isso pode levar alguns segundos dependendo da conexão.</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default PublicUploadPage;
