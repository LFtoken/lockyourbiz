import { useState, useEffect } from 'react';

type ConsentState = {
  analytics: boolean;
  advertising: boolean;
};

type BannerStage = 'banner' | 'customize' | 'hidden';

export default function CookieConsent() {
  const [stage, setStage] = useState<BannerStage>('hidden');
  const [preferences, setPreferences] = useState<ConsentState>({
    analytics: true,
    advertising: false,
  });

  useEffect(() => {
    // Check if consent was already given
    const saved = localStorage.getItem('cookie-consent');
    if (!saved) {
      // Small delay so the banner animates in
      setTimeout(() => setStage('banner'), 400);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      } catch {
        // Corrupt data — re-show banner
        setTimeout(() => setStage('banner'), 400);
      }
    }
  }, []);

  const applyConsent = (prefs: ConsentState) => {
    // Update gtag consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.advertising ? 'granted' : 'denied',
        ad_user_data: prefs.advertising ? 'granted' : 'denied',
        ad_personalization: prefs.advertising ? 'granted' : 'denied',
      });
    }

    // Save to localStorage
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));

    // Update window state for other scripts
    (window as any).__cookieConsent = prefs;

    setPreferences(prefs);
    setStage('hidden');
  };

  const acceptAll = () => {
    applyConsent({ analytics: true, advertising: true });
  };

  const rejectAll = () => {
    applyConsent({ analytics: false, advertising: false });
  };

  const saveCustom = () => {
    applyConsent(preferences);
  };

  const togglePref = (key: keyof ConsentState) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (stage === 'hidden') return null;

  return (
    <>
      {/* Backdrop */}
      {stage === 'customize' && (
        <div
          className="fixed inset-0 z-[9998] bg-black/30 transition-opacity"
          onClick={() => setStage('banner')}
        />
      )}

      {/* Banner / Customize Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up">
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          {stage === 'banner' && (
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-2xl sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🍪</span>
                    <h3 className="text-sm font-bold text-gray-900">We use cookies</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                    We use cookies for analytics (to understand what content helps you most) and to serve relevant ads through Google AdSense. You can accept all, reject all, or customize your preferences.{' '}
                    <a href="/privacy/" className="font-medium text-primary-600 hover:text-primary-700 underline">Learn more</a>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <button
                    onClick={() => setStage('customize')}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Customize
                  </button>
                  <button
                    onClick={rejectAll}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm transition-colors cursor-pointer min-h-[44px]"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          )}

          {stage === 'customize' && (
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900">Cookie Preferences</h3>
                <button
                  onClick={() => setStage('banner')}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Essential — always on */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Essential Cookies</p>
                    <p className="text-xs text-gray-600 mt-0.5">Required for the website to function — page navigation, form security, and basic site features. These cannot be disabled.</p>
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Always On</span>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Analytics Cookies</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Help us understand which pages you visit and how you use our tools, so we can improve the site. We use Google Analytics. No personal information is collected.
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={preferences.analytics}
                    onClick={() => togglePref('analytics')}
                    className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      preferences.analytics ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Advertising */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Advertising Cookies</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Used by Google AdSense to show advertisements that may be relevant to your interests. Disabling these means you will still see ads, but they may be less relevant.
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={preferences.advertising}
                    onClick={() => togglePref('advertising')}
                    className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      preferences.advertising ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.advertising ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={rejectAll}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer py-2 px-1"
                >
                  Reject All
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStage('banner')}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustom}
                    className="rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm transition-colors cursor-pointer min-h-[44px]"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
