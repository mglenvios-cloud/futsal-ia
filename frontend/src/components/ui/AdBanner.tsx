'use client';

/**
 * AdBanner — Espacio publicitario configurable
 *
 * Props:
 *  - size: 'leaderboard' (728x90) | 'rectangle' (300x250) | 'banner' (468x60) | 'sm' (compat)| 'md' | 'lg'
 *  - imageUrl: URL de imagen del anuncio
 *  - linkUrl:  URL de destino al hacer click
 *  - adCode:   HTML raw (Google AdSense, etc.)
 *  - label:    Texto de etiqueta (ej: "Publicidad")
 *
 * Para activar una publicidad real:
 *   <AdBanner size="leaderboard" imageUrl="https://..." linkUrl="https://..." />
 *   <AdBanner size="rectangle" adCode='<script>...</script>' />
 */

interface AdBannerProps {
  size?: 'sm' | 'md' | 'lg' | 'leaderboard' | 'rectangle' | 'banner';
  imageUrl?: string;
  linkUrl?: string;
  adCode?: string;
  label?: string;
  className?: string;
}

const SIZE_CONFIG = {
  sm:          { height: 'h-16',  minHeight: '64px',  maxWidth: '100%',   label: '728×90' },
  md:          { height: 'h-24',  minHeight: '96px',  maxWidth: '100%',   label: '300×250' },
  lg:          { height: 'h-32',  minHeight: '128px', maxWidth: '100%',   label: '970×90' },
  leaderboard: { height: 'h-24',  minHeight: '90px',  maxWidth: '728px',  label: '728×90' },
  rectangle:   { height: 'h-64',  minHeight: '250px', maxWidth: '300px',  label: '300×250' },
  banner:      { height: 'h-16',  minHeight: '60px',  maxWidth: '468px',  label: '468×60' },
};

export function AdBanner({
  size = 'sm',
  imageUrl,
  linkUrl,
  adCode,
  label,
  className = '',
}: AdBannerProps) {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.sm;

  // Si hay código HTML (AdSense u otro) — inyectar raw
  if (adCode) {
    return (
      <div
        className={`w-full flex justify-center my-1 ${className}`}
        dangerouslySetInnerHTML={{ __html: adCode }}
      />
    );
  }

  // Si hay imagen con link
  if (imageUrl) {
    const content = (
      <img
        src={imageUrl}
        alt={label || 'Publicidad'}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
    return (
      <div className={`w-full flex justify-center my-1 ${className}`}>
        <div
          className={`${config.height} w-full rounded-xl overflow-hidden border border-white/[0.06] shadow-md`}
          style={{ maxWidth: config.maxWidth }}
        >
          {linkUrl ? (
            <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block w-full h-full">
              {content}
            </a>
          ) : content}
        </div>
      </div>
    );
  }

  // Placeholder cuando no hay anuncio configurado
  return (
    <div className={`w-full flex justify-center my-1 ${className}`}>
      <div
        className={`
          ${config.height} w-full rounded-xl
          bg-gradient-to-r from-white/[0.015] via-white/[0.03] to-white/[0.015]
          border border-dashed border-white/[0.08]
          flex items-center justify-center
          relative overflow-hidden
          group cursor-pointer
          hover:border-orange-500/20 hover:from-orange-500/[0.02] hover:via-orange-500/[0.04] hover:to-orange-500/[0.02]
          transition-all duration-300
        `}
        style={{ maxWidth: config.maxWidth }}
        title="Espacio publicitario disponible"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="text-center select-none z-10">
          <div className="flex items-center gap-2 text-surface-600">
            <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] uppercase tracking-widest opacity-30 font-medium">
              {label || `Publicidad · ${config.label}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
