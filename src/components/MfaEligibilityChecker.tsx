import { useState, useMemo } from 'react';

interface Service {
  name: string; icon: string; supportsMfa: boolean; methods: string; setupGuide: string;
}

const services: Service[] = [
  { name: 'Google Workspace / Gmail', icon: '📧', supportsMfa: true, methods: 'Google Prompt, Authenticator App, YubiKey, Passkey', setupGuide: 'Google Admin → Security → 2-Step Verification → Enforce for all users' },
  { name: 'Microsoft 365 / Outlook', icon: '📧', supportsMfa: true, methods: 'Microsoft Authenticator, SMS, Phone Call, YubiKey', setupGuide: 'Azure AD → Security → MFA → Enable per user or via Conditional Access' },
  { name: 'Apple iCloud / Apple ID', icon: '🍎', supportsMfa: true, methods: 'Apple device prompt, SMS, YubiKey', setupGuide: 'Settings → [Your Name] → Sign-In & Security → Two-Factor Authentication' },
  { name: 'Shopify Admin', icon: '🛒', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey', setupGuide: 'Settings → Security → Two-step authentication → Activate' },
  { name: 'WooCommerce / WordPress', icon: '🌐', supportsMfa: true, methods: 'Authenticator App (via plugin)', setupGuide: 'Install Wordfence or WP 2FA plugin → Enable MFA for all admin users' },
  { name: 'Dropbox', icon: '📂', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey', setupGuide: 'Settings → Security → Two-step verification → Enable' },
  { name: 'QuickBooks Online', icon: '📊', supportsMfa: true, methods: 'Authenticator App, SMS', setupGuide: 'Sign In → Account Settings → Security → Multi-factor authentication' },
  { name: 'Salesforce', icon: '💼', supportsMfa: true, methods: 'Authenticator App, YubiKey, Built-in Authenticator', setupGuide: 'Setup → Users → Permission Sets → Assign "MFA Required" permission' },
  { name: 'Slack', icon: '💬', supportsMfa: true, methods: 'Authenticator App, SMS', setupGuide: 'Account Settings → Two-Factor Authentication → Set Up' },
  { name: 'Zoom', icon: '🎥', supportsMfa: true, methods: 'Authenticator App, SMS, Phone Call', setupGuide: 'Profile → Sign In & Security → Two-Factor Authentication → Turn On' },
  { name: 'Stripe', icon: '💳', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey', setupGuide: 'Profile → Security → Two-step authentication → Enable' },
  { name: 'PayPal Business', icon: '💳', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey', setupGuide: 'Settings → Security → 2-step verification → Set Up' },
  { name: 'GitHub', icon: '💻', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey, Passkey', setupGuide: 'Settings → Password and authentication → Enable two-factor authentication' },
  { name: 'GoDaddy / Domain Registrar', icon: '🌐', supportsMfa: true, methods: 'Authenticator App, SMS', setupGuide: 'Account Settings → Login & PIN → Two-Step Verification → Set Up' },
  { name: 'Namecheap', icon: '🌐', supportsMfa: true, methods: 'Authenticator App, SMS', setupGuide: 'Dashboard → Profile → Security → Two-Factor Authentication → Manage' },
  { name: 'cPanel / WHM', icon: '🖥️', supportsMfa: true, methods: 'Authenticator App', setupGuide: 'cPanel → Security → Two-Factor Authentication → Configure' },
  { name: 'Facebook Business', icon: '📱', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey', setupGuide: 'Business Suite → Settings → Security → Two-factor authentication' },
  { name: 'AWS / Amazon Web Services', icon: '☁️', supportsMfa: true, methods: 'Authenticator App, YubiKey, Hardware Key', setupGuide: 'IAM → Users → Security credentials → Assigned MFA device' },
  { name: 'X / Twitter', icon: '🐦', supportsMfa: true, methods: 'Authenticator App, SMS, YubiKey', setupGuide: 'Settings → Security and account access → Security → Two-factor authentication' },
  { name: 'LinkedIn', icon: '💼', supportsMfa: true, methods: 'Authenticator App, SMS', setupGuide: 'Settings → Sign in & security → Two-step verification → Turn on' },
];

export default function MfaEligibilityChecker() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const toggle = (name: string) => {
    const next = new Set(selected);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelected(next);
  };

  const results = useMemo(() => {
    if (!showResults) return null;
    const chosen = services.filter(s => selected.has(s.name));
    const withMfa = chosen.filter(s => s.supportsMfa);
    const withoutMfa = chosen.filter(s => !s.supportsMfa);
    return { total: chosen.length, withMfa, withoutMfa, pct: chosen.length > 0 ? Math.round((withMfa.length / chosen.length) * 100) : 0 };
  }, [selected, showResults]);

  const allSelected = selected.size > 0;

  if (showResults && results) return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your MFA Readiness Score</h2>
      <div className="rounded-xl bg-primary-50 border border-primary-200 p-6 text-center mb-6">
        <div className="text-4xl font-extrabold text-primary-700">{results.pct}%</div>
        <div className="text-sm text-primary-600 mt-1">{results.withMfa.length} of {results.total} services support MFA</div>
        <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${results.pct}%` }} /></div>
      </div>

      {results.withMfa.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-accent-800 mb-3">✅ Ready to Enable ({results.withMfa.length})</h3>
          <div className="space-y-2">
            {results.withMfa.map(s => (
              <details key={s.name} className="rounded-lg border border-accent-200 bg-accent-50/50 p-3 cursor-pointer">
                <summary className="text-sm font-medium text-gray-900">{s.icon} {s.name} — {s.methods}</summary>
                <p className="mt-2 text-xs text-gray-600"><strong>How to enable:</strong> {s.setupGuide}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-primary-50 border border-primary-200 p-5">
        <h3 className="font-bold text-primary-900 mb-2">Next Steps</h3>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Enable MFA on all listed services this week — start with email and financial accounts</li>
          <li>• For critical accounts, use <a href="/tool-reviews/mfa-tools/" class="underline">hardware keys (YubiKey)</a> instead of SMS</li>
          <li>• Read our <a href="/tool-reviews/mfa-tools/" class="underline">MFA tools comparison</a> to choose the right method</li>
        </ul>
      </div>

      <button onClick={() => { setShowResults(false); setSelected(new Set()); }} className="mt-4 w-full btn-secondary cursor-pointer min-h-[44px]">Check Another Set of Services</button>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">MFA Eligibility Checker</h2>
        <p className="mt-2 text-gray-600">Select all the online services your business uses. We will tell you which ones support MFA and show you exactly how to enable it — with step-by-step instructions.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
        {services.map(s => (
          <button
            key={s.name}
            onClick={() => toggle(s.name)}
            className={`rounded-lg border px-3 py-2.5 text-xs font-medium text-left transition-all cursor-pointer min-h-[44px] ${
              selected.has(s.name) ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="block text-lg mb-0.5">{s.icon}</span>
            {s.name}
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        {selected.size} service{selected.size !== 1 ? 's' : ''} selected
      </div>

      <button
        onClick={() => setShowResults(true)}
        disabled={!allSelected}
        className={`w-full btn-primary cursor-pointer min-h-[44px] ${!allSelected ? 'opacity-50 pointer-events-none' : ''}`}
      >
        Check MFA Eligibility →
      </button>
    </div>
  );
}
