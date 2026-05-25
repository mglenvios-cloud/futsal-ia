'use client';

export function AdBanner({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 'h-16', md: 'h-24', lg: 'h-32' };
  return (
    <div className={`${heights[size]} w-full rounded-xl bg-gradient-to-r from-white/[0.02] to-white/[0.04] border border-white/[0.06] flex items-center justify-center text-surface-500 text-xs select-none`}>
      <div className="text-center">
        <svg className="w-5 h-5 mx-auto mb-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <span className="opacity-20 text-[10px] uppercase tracking-widest">Espacio Publicitario</span>
      </div>
    </div>
  );
}
