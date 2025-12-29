import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Event } from '../types';
import { useEvents } from '../hooks/useEvents';
import FileUpload from '../components/FileUpload';
import Button from '../components/ui/Button';
import { PartyPopperIcon } from '../components/icons';

const PublicUploadPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { getEventById, addMediaToEvent } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError('');
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
      setUploadError('Erro: Informações do evento inválidas para upload.');
    }
  };

  const reset = () => {
    setFile(null);
    setUploadSuccess(false);
    setUploadError('');
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando evento...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-2xl font-bold">Evento não encontrado</h1>
        <p className="text-muted-foreground">O link pode estar quebrado ou o evento foi removido.</p>
      </div>
    </div>;
  }

  if (isExpired) {
    return <div className="flex items-center justify-center h-screen text-center p-4">
      <div>
        <h1 className="text-2xl font-bold">Evento Encerrado</h1>
        <p className="text-muted-foreground mt-2">Este evento não está mais aceitando o envio de mídias.</p>
      </div>
    </div>;
  }

  if (uploadSuccess) {
    return (
      <div className="flex items-center justify-center h-screen text-center p-4">
        <div className="max-w-md w-full">
          <PartyPopperIcon className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-2xl font-bold">Obrigado!</h1>
          <p className="text-muted-foreground mt-2 mb-6">Sua mídia foi enviada com sucesso para o evento "{event.name}".</p>
          <Button onClick={reset}>Enviar outra mídia</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Enviar Mídia para</h1>
          <p className="text-4xl font-extrabold text-primary mt-1">{event.name}</p>
        </div>

        {!file ? (
          <FileUpload onFileUpload={handleFileSelect} uploading={uploading} />
        ) : (
          <div className="space-y-4">
            <div className="w-full p-4 border rounded-lg bg-card text-center">
              <p className="font-semibold truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {uploadError && <p className="text-sm text-destructive text-center">{uploadError}</p>}
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => setFile(null)} disabled={uploading}>
                Trocar Arquivo
              </Button>
              <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}
      </div>
      <footer className="text-center text-muted-foreground text-sm mt-8">
        Powered by EventSnap
      </footer>
    </div>
  );
};

export default PublicUploadPage;