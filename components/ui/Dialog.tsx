
import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw]'
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-[2px] overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative z-[110] w-full ${sizeClasses[size]} bg-card text-card-foreground rounded-2xl shadow-2xl border overflow-hidden flex flex-col my-auto max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b shrink-0 bg-card">
          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full w-9 h-9 inline-flex justify-center items-center transition-colors"
            onClick={onClose}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Fechar</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
