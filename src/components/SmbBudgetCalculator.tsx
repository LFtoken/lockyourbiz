import { useState, useMemo } from 'react';

interface Category {
  name: string; icon: string; pct: number; description: string; tools: string;
}

export default function SmbBudgetCalculator() {
  const [employees, setEmployees] = useState(10);
  const [industry, setIndustry] = useState('general');
  const [revenue, setRevenue] = useState(500000);
  const [riskLevel, setRiskLevel] = useState('medium');

  const industryMultiplier = useMemo(() => {
    const multipliers: Record<string, number> = {
      general: 1.0, retail: 1.1, ecommerce: 1.2, healthcare: 1.5,
      legal: 1.4, finance: 1.5, manufacturing: 1.2, tech: 1.3,
    };
    return multipliers[industry] || 1.0;
  }, [industry]);

  const riskMultiplier = useMemo(() => {
    return riskLevel === 'low' ? 0.8 : riskLevel === 'medium' ? 1.0 : 1.3;
  }, [riskLevel]);

  const annualBudget = useMemo(() => {
    const basePerEmployee = 800;
    const baseFromRevenue = revenue * 0.008;
    const raw = (basePerEmployee * employees + baseFromRevenue) * industryMultiplier * riskMultiplier;
    return Math.round(raw / 100) * 100;
  }, [employees, revenue, industryMultiplier, riskMultiplier]);

  const categories: Category[] = useMemo(() => [
    { name: 'Endpoint Protection', icon: '🛡️', pct: 0.25, description: 'Antivirus, EDR, device management', tools: 'Bitdefender GravityZone, Microsoft Defender for Business' },
    { name: 'Email Security', icon: '📧', pct: 0.15, description: 'Anti-phishing gateway, spam filtering', tools: 'Avanan, Proofpoint Essentials, Barracuda' },
    { name: 'Backup & Recovery', icon: '💾', pct: 0.18, description: 'Cloud backup, disaster recovery', tools: 'Backblaze, Acronis, IDrive' },
    { name: 'Identity & Access', icon: '🔑', pct: 0.12, description: 'Password manager, MFA, SSO', tools: 'Bitwarden, Duo, YubiKey' },
    { name: 'Training & Awareness', icon: '👥', pct: 0.10, description: 'Security training, phishing simulations', tools: 'KnowBe4, free training scripts, phishing quiz' },
    { name: 'Network Security', icon: '🌐', pct: 0.12, description: 'Firewall, VPN, WiFi security', tools: 'Cloudflare, Ubiquiti, Tailscale' },
    { name: 'Insurance & Compliance', icon: '📋', pct: 0.08, description: 'Cyber insurance, compliance tools', tools: 'Cyber policy, compliance toolkit, legal review' },
  ], []);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">SMB Security Budget Calculator</h2>
        <p className="mt-2 text-gray-600">Adjust the sliders to estimate your recommended annual cybersecurity budget.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Number of Employees</label>
          <input type="range" min="1" max="50" value={employees} onChange={e => setEmployees(+e.target.value)} class="w-full cursor-pointer" />
          <div class="flex justify-between text-xs text-gray-500"><span>1</span><span class="font-bold text-primary-700">{employees}</span><span>50</span></div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm cursor-pointer min-h-[44px]">
            <option value="general">General Business</option>
            <option value="retail">Retail</option>
            <option value="ecommerce">E-Commerce</option>
            <option value="healthcare">Healthcare</option>
            <option value="legal">Legal Services</option>
            <option value="finance">Financial Services</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="tech">Technology</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Annual Revenue ($)</label>
          <select value={revenue} onChange={e => setRevenue(+e.target.value)} class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm cursor-pointer min-h-[44px]">
            <option value={100000}>$100,000</option>
            <option value={250000}>$250,000</option>
            <option value={500000}>$500,000</option>
            <option value={1000000}>$1,000,000</option>
            <option value={2500000}>$2,500,000</option>
            <option value={5000000}>$5,000,000</option>
            <option value={10000000}>$10,000,000+</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Risk Profile</label>
          <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm cursor-pointer min-h-[44px]">
            <option value="low">Low — Minimal data, low profile</option>
            <option value="medium">Medium — Standard business data</option>
            <option value="high">High — Sensitive data, regulated</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-primary-700 p-6 text-center mb-8">
        <div className="text-sm font-medium text-primary-200">Recommended Annual Security Budget</div>
        <div className="mt-1 text-4xl font-extrabold text-white">${annualBudget.toLocaleString()}</div>
        <div className="mt-1 text-sm text-primary-200">
          ≈ {Math.round(annualBudget / revenue * 1000) / 10}% of revenue · ${Math.round(annualBudget / employees)}/employee
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Allocation Breakdown</h3>
      <div className="space-y-3">
        {categories.map(cat => {
          const amount = Math.round(annualBudget * cat.pct);
          return (
            <div key={cat.name} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">{cat.icon} {cat.name}</span>
                <span className="text-sm font-bold text-primary-700">${amount.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${cat.pct * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                <span>{cat.description}</span>
                <span>{Math.round(cat.pct * 100)}%</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">Tools: {cat.tools}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl bg-accent-50 border border-accent-200 p-5 text-sm text-accent-800">
        <strong>💡 Budget Tip:</strong> Start with the highest-impact items (endpoint protection + backup) and build out from there. Many tools have free tiers for very small teams. For businesses with fewer than 10 employees, some categories can be consolidated to reduce cost.
      </div>
    </div>
  );
}
