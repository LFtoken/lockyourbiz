import { useState, useMemo } from 'react';

interface Tool {
  name: string;
  category: string;
  price: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  url: string;
  logo: string;
}

const tools: Tool[] = [
  {
    name: 'Bitwarden',
    category: 'Password Manager',
    price: 'Free / $10/yr Premium',
    bestFor: 'Teams that need simple, affordable password management',
    pros: ['Open source & audited', 'Unlimited devices on free plan', 'Self-hosting option', 'Great browser extensions'],
    cons: ['UI less polished than competitors', 'Premium features are basic'],
    url: 'https://bitwarden.com',
    logo: '🔑',
  },
  {
    name: '1Password',
    category: 'Password Manager',
    price: '$19.95/mo for up to 10 users',
    bestFor: 'Growing businesses needing advanced sharing and reporting',
    pros: ['Best-in-class UI/UX', 'Travel mode', 'Watchtower breach alerts', 'Excellent team management'],
    cons: ['No free tier', 'No self-hosting', 'Pricier than alternatives'],
    url: 'https://1password.com',
    logo: '🗝️',
  },
  {
    name: 'Cloudflare Zero Trust',
    category: 'Network Security',
    price: 'Free for up to 50 users',
    bestFor: 'Replacing VPNs with zero-trust access for remote teams',
    pros: ['Generous free tier (50 seats)', 'Replaces traditional VPN', 'Built-in DDoS protection', 'Global CDN included'],
    cons: ['Can be complex to set up', 'Advanced features need paid plan', 'Vendor lock-in risk'],
    url: 'https://www.cloudflare.com/zero-trust/',
    logo: '🌐',
  },
  {
    name: 'LastPass',
    category: 'Password Manager',
    price: '$4/user/month Teams',
    bestFor: 'Small teams wanting a well-known, easy-to-use solution',
    pros: ['User-friendly interface', 'Good sharing features', 'Security dashboard'],
    cons: ['Past security breaches (2022)', 'Limited free tier', 'Some features require business plan'],
    url: 'https://lastpass.com',
    logo: '🔒',
  },
  {
    name: 'Proton Mail',
    category: 'Email Security',
    price: 'Free / $6.99/mo Business',
    bestFor: 'Businesses handling sensitive client communications',
    pros: ['End-to-end encryption', 'Swiss privacy laws', 'Zero-access encryption', 'Open source'],
    cons: ['Limited calendar features', 'Search limited in encrypted mail', 'Fewer integrations'],
    url: 'https://proton.me',
    logo: '✉️',
  },
  {
    name: 'Veeam Backup',
    category: 'Backup & Recovery',
    price: 'Free community edition available',
    bestFor: 'Businesses needing reliable data backup and ransomware recovery',
    pros: ['Industry standard for backups', 'Immutable backups (ransomware-proof)', 'Free community edition', 'Wide platform support'],
    cons: ['Can be complex to configure', 'Enterprise pricing is high', 'Resource-heavy'],
    url: 'https://veeam.com',
    logo: '💾',
  },
  {
    name: 'ClamAV + ClamWin',
    category: 'Antivirus',
    price: 'Free',
    bestFor: 'Budget-conscious businesses needing basic malware scanning',
    pros: ['Completely free', 'Open source', 'Lightweight', 'Cross-platform'],
    cons: ['Real-time protection limited on Windows', 'No central management', 'Detection rates lower than paid AV'],
    url: 'https://www.clamav.net',
    logo: '🦠',
  },
  {
    name: 'Have I Been Pwned',
    category: 'Breach Monitoring',
    price: 'Free',
    bestFor: 'Checking if your business email accounts have been compromised',
    pros: ['Free to use', 'Trusted by security professionals', 'Domain-wide monitoring', 'API available'],
    cons: ['Reactive — tells you after a breach', 'Does not prevent breaches', 'No real-time alerting on free tier'],
    url: 'https://haveibeenpwned.com',
    logo: '🔍',
  },
  {
    name: 'pfSense',
    category: 'Firewall',
    price: 'Free (requires hardware)',
    bestFor: 'Tech-savvy businesses wanting enterprise-grade firewall at zero cost',
    pros: ['Enterprise features for free', 'Highly customizable', 'Active community', 'VPN, VLAN, QoS built in'],
    cons: ['Steep learning curve', 'Requires dedicated hardware', 'No official support on free version'],
    url: 'https://www.pfsense.org',
    logo: '🧱',
  },
];

const categories = ['All', ...Array.from(new Set(tools.map((t) => t.category)))];

export default function ToolComparison() {
  const [filter, setFilter] = useState('All');
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () => (filter === 'All' ? tools : tools.filter((t) => t.category === filter)),
    [filter]
  );

  const toggleSelect = (name: string) => {
    setSelectedTools((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const compareList = tools.filter((t) => selectedTools.has(t.name));

  return (
    <div className="mx-auto max-w-4xl">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer ${
              filter === cat
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => {
          const isSelected = selectedTools.has(tool.name);
          return (
            <button
              key={tool.name}
              onClick={() => toggleSelect(tool.name)}
              className={`text-left rounded-xl border-2 p-5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{tool.logo}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{tool.name}</h3>
                  <span className="text-xs text-gray-500">{tool.category}</span>
                </div>
              </div>
              <div className="text-xs font-mono text-primary-700 font-medium">{tool.price}</div>
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      {compareList.length >= 2 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Comparing {compareList.map((t) => t.name).join(' vs ')}
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  {compareList.map((t) => (
                    <th key={t.name} className="text-left p-4 font-semibold text-gray-900 min-w-[180px]">
                      <span className="text-2xl block mb-1">{t.logo}</span>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-4 text-gray-500 font-medium">Price</td>
                  {compareList.map((t) => (
                    <td key={t.name} className="p-4 font-mono text-xs font-semibold text-primary-700">{t.price}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-gray-500 font-medium">Best For</td>
                  {compareList.map((t) => (
                    <td key={t.name} className="p-4 text-gray-700">{t.bestFor}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-gray-500 font-medium">Pros</td>
                  {compareList.map((t) => (
                    <td key={t.name} className="p-4">
                      <ul className="space-y-1">
                        {t.pros.map((p) => (
                          <li key={p} className="text-green-700 text-xs">✓ {p}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-gray-500 font-medium">Cons</td>
                  {compareList.map((t) => (
                    <td key={t.name} className="p-4">
                      <ul className="space-y-1">
                        {t.cons.map((c) => (
                          <li key={c} className="text-red-600 text-xs">✗ {c}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
