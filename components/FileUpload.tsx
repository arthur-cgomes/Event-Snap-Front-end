
import React, { useRef } from 'react';
import { UploadCloudIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  uploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, uploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {

      const selectedFiles = Array.from(e.target.files);
      onFileUpload(selectedFiles);

      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onButtonClick = () => {
    if (!uploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative w-full aspect-square md:aspect-video flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-3xl text-center cursor-pointer transition-all active:scale-95 bg-card hover:bg-accent/30 border-primary/30 hover:border-primary shadow-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onButtonClick}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*,video/*"
        disabled={uploading}
        multiple
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-6 bg-primary/10 rounded-full">
          <UploadCloudIcon className="w-12 h-12 text-primary" />
        </div>
        <div>
          <p className="text-xl font-black text-foreground">Enviar Fotos ou Vídeos</p>
          <p className="text-sm text-muted-foreground mt-1">Toque para selecionar até 15 mídias</p>
        </div>
        <div className="flex gap-2 pt-2">
          <span className="px-3 py-1 bg-muted text-[10px] font-bold uppercase rounded-full">Múltiplos Arquivos</span>
          <span className="px-3 py-1 bg-muted text-[10px] font-bold uppercase rounded-full">Fotos & Vídeos</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
