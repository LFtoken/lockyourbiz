import { useState, useEffect, useMemo } from 'react';

interface CisaVuln {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes: string;
}

interface CisaResponse {
  title: string;
  catalogVersion: string;
  dateReleased: string;
  count: number;
  vulnerabilities: CisaVuln[];
}

const SMB_VENDORS = [
  'Microsoft', 'Google', 'Apple', 'Adobe', 'Cisco', 'Fortinet', 'Palo Alto',
  'WordPress', 'Drupal', 'Apache', 'nginx', 'PHP', 'MySQL', 'Zoom', 'Slack',
  'Citrix', 'VMware', 'Atlassian', 'GitLab', 'Zoho', 'Salesforce', 'Oracle',
  'Ivanti', 'SonicWall', 'QNAP', 'Synology', 'Sophos', 'JetBrains',
];

const SEVERITY_KEYWORDS: Record<string, string> = {
  'remote code execution': '🔴 Critical',
  'privilege escalation': '🟠 High',
  'authentication bypass': '🟠 High',
  'zero-day': '🔴 Critical',
  'ransomware': '🔴 Critical',
  'arbitrary code': '🔴 Critical',
  'sql injection': '🟠 High',
  'cross-site': '🟡 Medium',
  'denial of service': '🟡 Medium',
  'information disclosure': '🟡 Medium',
};

function getSeverity(vuln: CisaVuln): string {
  const desc = (vuln.shortDescription + vuln.vulnerabilityName).toLowerCase();
  if (vuln.knownRansomwareCampaignUse === 'Known') return '🔴 Ransomware';
  for (const [keyword, label] of Object.entries(SEVERITY_KEYWORDS)) {
    if (desc.includes(keyword)) return label;
  }
  return '🟠 High';
}

function isSmbRelevant(vuln: CisaVuln): boolean {
  return SMB_VENDORS.some(v => vuln.vendorProject.toLowerCase().includes(v.toLowerCase()));
}

function daysAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

export default function ThreatFeed(_props: any) {
  const [data, setData] = useState<CisaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ransomware' | 'smb' | 'recent'>('smb');
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    // Read build-time embedded data from script tag (no CORS, always works)
    const el = document.getElementById('threat-data');
    if (el && el.textContent) {
      try {
        const parsed = JSON.parse(el.textContent);
        if (parsed.data?.vulnerabilities) {
          setData(parsed.data);
          setLastUpdated(parsed.buildTime ? new Date(parsed.buildTime).toLocaleString() : '');
          setLoading(false);
          return;
        }
      } catch {}
    }
    // Fallback: live client-side fetch (may hit CORS)
    fetchLive();
  }, []);

  const fetchLive = async () => {
    try {
      setLoading(true);
      const resp = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json: CisaResponse = await resp.json();
      json.vulnerabilities.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      setData(json);
      setLastUpdated(new Date().toLocaleString());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch threat data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data.vulnerabilities;
    if (filter === 'ransomware') list = list.filter(v => v.knownRansomwareCampaignUse === 'Known');
    else if (filter === 'smb') list = list.filter(v => isSmbRelevant(v));
    else if (filter === 'recent') list = list.filter(v => daysAgo(v.dateAdded).includes('day') || daysAgo(v.dateAdded) === 'Today' || daysAgo(v.dateAdded) === 'Yesterday');
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(v => v.cveID.toLowerCase().includes(s) || v.vendorProject.toLowerCase().includes(s) || v.product.toLowerCase().includes(s) || v.vulnerabilityName.toLowerCase().includes(s));
    }
    return list.slice(0, 50);
  }, [data, filter, search]);

  const ransomwareCount = data?.vulnerabilities.filter(v => v.knownRansomwareCampaignUse === 'Known').length || 0;
  const smbCount = data?.vulnerabilities.filter(v => isSmbRelevant(v)).length || 0;
  const recentCount = data?.vulnerabilities.filter(v => daysAgo(v.dateAdded).includes('day') || daysAgo(v.dateAdded) === 'Today' || daysAgo(v.dateAdded) === 'Yesterday').length || 0;

  if (loading && !data) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin text-3xl mb-4">🔄</div>
      <p className="text-gray-600">Loading threat intelligence...</p>
      <p className="text-xs text-gray-400 mt-2">Data source: CISA Known Exploited Vulnerabilities Catalog</p>
    </div>
  );

  if (error && !data) return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
      <div className="text-3xl mb-2">⚠️</div>
      <p className="text-red-700 font-semibold">Unable to load threat data</p>
      <p className="text-sm text-red-600 mt-1">{error}</p>
      <button onClick={fetchLive} className="mt-4 btn-secondary cursor-pointer min-h-[44px] text-sm">Retry</button>
    </div>
  );

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-primary-700">{data?.count || 0}</div>
          <div className="text-xs text-gray-600 mt-1">Total KEV Entries</div>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-red-700">{ransomwareCount}</div>
          <div className="text-xs text-red-600 mt-1">Ransomware Used</div>
        </div>
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-orange-700">{smbCount}</div>
          <div className="text-xs text-orange-600 mt-1">SMB-Relevant</div>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-blue-700">{recentCount}</div>
          <div className="text-xs text-blue-600 mt-1">Added This Week</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {(['all', 'ransomware', 'smb', 'recent'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {f === 'all' ? 'All' : f === 'ransomware' ? '🔴 Ransomware' : f === 'smb' ? '🏢 SMB' : '🆕 Recent'}
          </button>
        ))}
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendor, product, CVE..." className="ml-auto rounded-lg border border-gray-300 px-3 py-2.5 text-sm min-h-[44px] w-full sm:w-64" />
      </div>

      {/* Threat List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No threats match your filter.</div>
        ) : filtered.map(v => (
          <details key={v.cveID} className="group rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
            <summary className="flex flex-wrap items-center gap-2 px-5 py-4 cursor-pointer min-h-[44px]">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{
                background: v.knownRansomwareCampaignUse === 'Known' ? '#FEE2E2' : isSmbRelevant(v) ? '#FFEDD5' : '#F3F4F6',
                color: v.knownRansomwareCampaignUse === 'Known' ? '#991B1B' : isSmbRelevant(v) ? '#9A3412' : '#4B5563',
              }}>{getSeverity(v)}</span>
              <a href={`https://nvd.nist.gov/vuln/detail/${v.cveID}`} target="_blank" rel="noopener" className="text-sm font-bold text-primary-700 hover:underline" onClick={e => e.stopPropagation()}>{v.cveID}</a>
              <span className="text-sm text-gray-700">{v.vendorProject} — {v.product}</span>
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{daysAgo(v.dateAdded)}</span>
            </summary>
            <div className="px-5 pb-4 space-y-2 text-sm border-t border-gray-100 pt-3">
              <p className="text-gray-700"><strong>Vulnerability:</strong> {v.vulnerabilityName}</p>
              {v.shortDescription && <p className="text-gray-600">{v.shortDescription}</p>}
              <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                <strong className="text-red-800">🛡️ Required Action {v.dueDate ? `(by ${v.dueDate})` : ''}:</strong>
                <p className="text-red-700 mt-1">{v.requiredAction}</p>
              </div>
              {v.notes && <p className="text-gray-500 text-xs">📝 {v.notes}</p>}
              <div className="flex gap-3 text-xs pt-1">
                <a href={`https://nvd.nist.gov/vuln/detail/${v.cveID}`} target="_blank" rel="noopener" className="text-primary-600 hover:underline">NVD Details →</a>
                {v.knownRansomwareCampaignUse === 'Known' && <span className="text-red-600 font-semibold">⚠️ Actively used in ransomware campaigns</span>}
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400 space-y-1">
        <p>Data: <a href="https://www.cisa.gov/known-exploited-vulnerabilities-catalog" target="_blank" rel="noopener" className="underline">CISA KEV Catalog</a> · Built at: {buildTime || lastUpdated || 'Unknown'}</p>
        <p>Page rebuilds on every deployment — data is always fresh. Total catalog: {data?.catalogVersion || 'N/A'}</p>
      </div>
    </div>
  );
}
