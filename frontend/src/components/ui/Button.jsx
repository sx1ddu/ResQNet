import React from 'react';
import { IconRefreshCw } from './Icons.jsx';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  onClick,
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-control transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none text-center';

  const sizeClasses = {
    sm: 'min-h-[32px] px-3 py-1 text-xs gap-1.5',
    md: 'min-h-[42px] px-4 py-2 text-sm gap-2',
    lg: 'min-h-[48px] px-5 py-2.5 text-base gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary: 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-700 shadow-sm active:bg-blue-900',
    critical: 'bg-coral-700 hover:bg-coral-800 text-white border border-coral-700 shadow-sm active:bg-coral-900',
    secondary: 'bg-white hover:bg-slate-50 text-ink-950 border border-line shadow-xs active:bg-slate-100',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:bg-slate-200',
    dark: 'bg-surfaceDark-raised hover:bg-surfaceDark-highlight text-white border border-surfaceDark-border active:bg-ink-800',
    outlineDark: 'bg-transparent hover:bg-surfaceDark-panel text-slate-200 border border-surfaceDark-border',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <IconRefreshCw className="animate-spin" width={16} height={16} />
          <span>Processing…</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
