
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  uploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, uploading }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement | HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-accent' : 'border-muted-foreground/50 hover:border-primary'}`}
      onClick={onButtonClick}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*,video/*"
        disabled={uploading}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadCloudIcon className="w-16 h-16 text-muted-foreground" />
        <p className="font-semibold">Arraste e solte arquivos aqui</p>
        <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
        <p className="text-xs text-muted-foreground">Fotos e vídeos são permitidos</p>
      </div>
    </div>
  );
};

export default FileUpload;
