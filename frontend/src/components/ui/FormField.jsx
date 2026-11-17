import React from 'react';

export function FormField({
  label,
  id,
  required = false,
  error = null,
  helperText = null,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-700 tracking-wide uppercase"
        >
          {label} {required && <span className="text-coral-700">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-xs text-slate-500 leading-normal">{helperText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-coral-700 flex items-center gap-1" role="alert">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  id,
  type = 'text',
  error,
  className = '',
  dark = false,
  ...props
}) {
  const base =
    'w-full min-h-[42px] px-3.5 py-2 text-sm rounded-control border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-700/20 disabled:bg-slate-100 disabled:cursor-not-allowed';

  const lightStyle = error
    ? 'border-coral-700 bg-white text-slate-900 focus:border-coral-700'
    : 'border-line bg-white text-slate-900 focus:border-blue-700 hover:border-slate-400 placeholder:text-slate-400';

  const darkStyle = error
    ? 'border-coral-600 bg-surfaceDark-panel text-white focus:border-coral-600'
    : 'border-surfaceDark-border bg-surfaceDark-panel text-white focus:border-blue-600 hover:border-slate-500 placeholder:text-slate-400';

  return (
    <input
      id={id}
      type={type}
      className={`${base} ${dark ? darkStyle : lightStyle} ${className}`}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function Textarea({
  id,
  rows = 3,
  error,
  className = '',
  dark = false,
  ...props
}) {
  const base =
    'w-full px-3.5 py-2.5 text-sm rounded-control border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-700/20 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y';

  const lightStyle = error
    ? 'border-coral-700 bg-white text-slate-900 focus:border-coral-700'
    : 'border-line bg-white text-slate-900 focus:border-blue-700 hover:border-slate-400 placeholder:text-slate-400';

  const darkStyle = error
    ? 'border-coral-600 bg-surfaceDark-panel text-white focus:border-coral-600'
    : 'border-surfaceDark-border bg-surfaceDark-panel text-white focus:border-blue-600 hover:border-slate-500 placeholder:text-slate-400';

  return (
    <textarea
      id={id}
      rows={rows}
      className={`${base} ${dark ? darkStyle : lightStyle} ${className}`}
      aria-invalid={Boolean(error)}
      {...props}
    />
  );
}

export function Select({
  id,
  error,
  children,
  className = '',
  dark = false,
  ...props
}) {
  const base =
    'w-full min-h-[42px] px-3.5 py-2 text-sm rounded-control border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-700/20 disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer bg-no-repeat bg-right';

  const lightStyle = error
    ? 'border-coral-700 bg-white text-slate-900 focus:border-coral-700'
    : 'border-line bg-white text-slate-900 focus:border-blue-700 hover:border-slate-400';

  const darkStyle = error
    ? 'border-coral-600 bg-surfaceDark-panel text-white focus:border-coral-600'
    : 'border-surfaceDark-border bg-surfaceDark-panel text-white focus:border-blue-600 hover:border-slate-500';

  return (
    <select
      id={id}
      className={`${base} ${dark ? darkStyle : lightStyle} ${className}`}
      aria-invalid={Boolean(error)}
      {...props}
    >
      {children}
    </select>
  );
}
