
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className={`relative z-50 w-full ${sizeClasses[size]} bg-card text-card-foreground rounded-lg shadow-xl border overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 border-b shrink-0">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            type="button"
            className="text-muted-foreground bg-transparent hover:bg-accent hover:text-accent-foreground rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            onClick={onClose}
          >
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">Close modal</span>
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
