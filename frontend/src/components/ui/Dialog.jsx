import React, { useEffect, useRef } from 'react';
import { IconX } from './Icons.jsx';

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  dark = false,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className={`w-full ${maxWidth} rounded-panel p-6 shadow-modal border ${
          dark
            ? 'bg-surfaceDark-panel border-surfaceDark-border text-white'
            : 'bg-white border-line text-slate-900'
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="dialog-title" className="text-lg font-bold tracking-tight">
              {title}
            </h2>
            {description && (
              <p
                className={`mt-1 text-xs ${
                  dark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-control transition-colors ${
              dark
                ? 'hover:bg-surfaceDark-raised text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Close dialog"
          >
            <IconX width={18} height={18} />
          </button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default Dialog;
