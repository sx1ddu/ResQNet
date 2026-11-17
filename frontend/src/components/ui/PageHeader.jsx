import React from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  badge,
  dark = false,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-4 border-b ${
        dark ? 'border-surfaceDark-border' : 'border-line'
      } ${className}`}
    >
      <div>
        {eyebrow && (
          <div
            className={`text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5 ${
              dark ? 'text-blue-400' : 'text-blue-700'
            }`}
          >
            {eyebrow}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              dark ? 'text-white' : 'text-ink-950'
            }`}
          >
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p
            className={`mt-1.5 text-sm max-w-2xl leading-relaxed ${
              dark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
