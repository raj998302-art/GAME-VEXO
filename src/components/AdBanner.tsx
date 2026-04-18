import React, { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  useEffect(() => {
    try {
      if (window && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`overflow-hidden rounded-xl bg-card-bg border border-border-color flex items-center justify-center p-2 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%', textAlign: 'center' }}
        data-ad-client="ca-pub-2383849036873542"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {/* Fallback for dev mode when ads might be blocked */}
      <div className="absolute opacity-10 text-[10px] uppercase font-bold tracking-widest pointer-events-none">Advertisement</div>
    </div>
  );
}
