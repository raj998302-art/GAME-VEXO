import React, { useState } from 'react';
import { DollarSign, Save } from 'lucide-react';

export default function AdsManagement() {
  const [ads, setAds] = useState({
    header: { enabled: true, code: '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXX" data-ad-slot="XXXXXX" data-ad-format="auto"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>' },
    sidebar: { enabled: true, code: '' },
    inContent: { enabled: false, code: '' },
    inGame: { enabled: true, code: '' },
    footer: { enabled: false, code: '' },
    interstitial: { enabled: true, code: '' },
  });

  const handleChange = (placement: keyof typeof ads, field: 'enabled' | 'code', value: any) => {
    setAds(prev => ({
      ...prev,
      [placement]: {
        ...prev[placement],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving ads configuration:', ads);
    alert('Ads configuration saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-text-main flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-500" />
          Ads Management
        </h1>
        <p className="text-text-dim">Configure AdSense or other ad network codes for various placements.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {(Object.entries(ads) as [string, { enabled: boolean, code: string }][]).map(([placement, config]) => (
          <div key={placement} className="bg-card-bg border border-border-color rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-main capitalize">{placement.replace(/([A-Z])/g, ' $1').trim()} Ads</h2>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={config.enabled}
                    onChange={(e) => handleChange(placement as keyof typeof ads, 'enabled', e.target.checked)}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${config.enabled ? 'bg-primary-color' : 'bg-[#27272a]'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${config.enabled ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-text-dim font-medium">
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </div>
              </label>
            </div>
            
            {config.enabled && (
              <div className="space-y-2 mt-4">
                <label className="text-sm font-medium text-text-dim">Ad Code (HTML/JS)</label>
                <textarea 
                  value={config.code}
                  onChange={(e) => handleChange(placement as keyof typeof ads, 'code', e.target.value)}
                  rows={4}
                  className="w-full bg-[#09090b] border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:border-primary-color transition-colors text-text-main font-mono text-sm"
                  placeholder="Paste your ad code snippet here..."
                />
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-color text-white font-bold hover:bg-primary-color/90 transition-colors shadow-[0_0_15px_var(--primary-glow)]">
            <Save className="w-5 h-5" />
            Save Ad Settings
          </button>
        </div>
      </form>
    </div>
  );
}
