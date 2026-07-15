import { useState, useMemo } from 'react';

interface Question {
  id: number;
  category: string;
  question: string;
  options: { label: string; score: number }[];
}

interface CategoryResult {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'good' | 'ok' | 'poor' | 'critical';
  advice: string;
  guideLink?: { text: string; url: string };
}

const questions: Question[] = [
  // Passwords & Authentication (4 questions)
  {
    id: 1, category: 'Passwords & Authentication',
    question: 'How do you manage passwords across your business?',
    options: [
      { label: 'We reuse passwords or store them in spreadsheets/notes', score: 0 },
      { label: 'Some of us use a password manager', score: 1 },
      { label: 'Everyone uses a password manager — unique passwords for every account', score: 2 },
    ],
  },
  {
    id: 2, category: 'Passwords & Authentication',
    question: 'Which accounts have two-factor authentication (2FA) enabled?',
    options: [
      { label: "We haven't enabled 2FA on anything yet", score: 0 },
      { label: 'Only email and banking accounts', score: 1 },
      { label: 'Email, banking, domain registrar, cloud apps, CRM — everything critical', score: 2 },
    ],
  },
  {
    id: 3, category: 'Passwords & Authentication',
    question: 'What happens when an employee leaves your company?',
    options: [
      { label: 'We change passwords if we remember — no formal process', score: 0 },
      { label: 'We change shared passwords but sometimes miss accounts', score: 1 },
      { label: 'Formal offboarding checklist: revoke all access within 24 hours, documented', score: 2 },
    ],
  },
  {
    id: 4, category: 'Passwords & Authentication',
    question: 'Do you use hardware security keys (YubiKey, etc.) for critical accounts?',
    options: [
      { label: "We don't use hardware keys", score: 0 },
      { label: 'The owner has one, but not all critical staff', score: 1 },
      { label: 'All admins and finance staff use hardware security keys', score: 2 },
    ],
  },

  // Backups & Recovery (3 questions)
  {
    id: 5, category: 'Backups & Recovery',
    question: 'What is your current backup strategy?',
    options: [
      { label: 'We do not have a backup strategy', score: 0 },
      { label: 'We back up manually when we remember', score: 1 },
      { label: 'Automated daily backups, 3-2-1 rule: 3 copies, 2 media types, 1 offsite', score: 2 },
    ],
  },
  {
    id: 6, category: 'Backups & Recovery',
    question: 'When did you last test restoring from a backup?',
    options: [
      { label: 'Never — we assume backups are working', score: 0 },
      { label: 'More than 6 months ago', score: 1 },
      { label: 'Within the past 3 months — we test quarterly', score: 2 },
    ],
  },
  {
    id: 7, category: 'Backups & Recovery',
    question: 'Are your backups protected against ransomware?',
    options: [
      { label: "Our backup drive is always connected — ransomware could encrypt it too", score: 0 },
      { label: 'We have cloud backup but it syncs in real-time (could sync encrypted files)', score: 1 },
      { label: 'Immutable backups configured — ransomware cannot modify or delete them', score: 2 },
    ],
  },

  // Network Security (3 questions)
  {
    id: 8, category: 'Network Security',
    question: 'How is your office network configured?',
    options: [
      { label: 'Single Wi-Fi for everything — business, guests, IoT devices all on one network', score: 0 },
      { label: 'Password-protected Wi-Fi but no network segmentation', score: 1 },
      { label: 'Separate VLANs for business devices, guest Wi-Fi, and IoT — all isolated', score: 2 },
    ],
  },
  {
    id: 9, category: 'Network Security',
    question: 'Is your router/firewall properly secured?',
    options: [
      { label: "We use the ISP-provided router with default settings", score: 0 },
      { label: 'Default passwords changed, firmware updated recently', score: 1 },
      { label: 'Dedicated firewall (pfSense/UniFi), auto-updated, UPnP disabled, IDS enabled', score: 2 },
    ],
  },
  {
    id: 10, category: 'Network Security',
    question: 'Is Remote Desktop (RDP) exposed to the internet?',
    options: [
      { label: "Yes, or we don't know — we just set it up to work", score: 0 },
      { label: 'RDP is behind a VPN but still reachable', score: 1 },
      { label: 'RDP is never exposed — we use zero-trust or VPN with MFA only', score: 2 },
    ],
  },

  // Devices & Endpoints (3 questions)
  {
    id: 11, category: 'Devices & Endpoints',
    question: 'Are all company laptops encrypted?',
    options: [
      { label: "No, or we don't know what disk encryption is", score: 0 },
      { label: 'Some devices have encryption enabled', score: 1 },
      { label: 'Every laptop has full disk encryption (BitLocker/FileVault) and auto-lock after 5 min', score: 2 },
    ],
  },
  {
    id: 12, category: 'Devices & Endpoints',
    question: 'How do you manage device updates?',
    options: [
      { label: 'We click "Remind me later" — updates are annoying', score: 0 },
      { label: 'We update when something stops working', score: 1 },
      { label: 'Automatic updates enabled on all OS, browsers, and critical software', score: 2 },
    ],
  },
  {
    id: 13, category: 'Devices & Endpoints',
    question: 'Are personal devices used for work?',
    options: [
      { label: 'Yes, with no restrictions or security requirements', score: 0 },
      { label: 'Yes, but we ask people to be careful', score: 1 },
      { label: 'Either company-provided devices required, or BYOD with enforced security policies', score: 2 },
    ],
  },

  // Email Security (2 questions)
  {
    id: 14, category: 'Email Security',
    question: 'Have you configured email authentication (SPF, DKIM, DMARC) for your domain?',
    options: [
      { label: "I don't know what SPF/DKIM/DMARC are", score: 0 },
      { label: 'SPF is set up, but DKIM and DMARC are not', score: 1 },
      { label: 'SPF, DKIM, and DMARC all configured and enforced', score: 2 },
    ],
  },
  {
    id: 15, category: 'Email Security',
    question: 'Do employees know how to spot a phishing email?',
    options: [
      { label: "We've never discussed phishing as a team", score: 0 },
      { label: 'We talked about it once, but no formal training', score: 1 },
      { label: 'Regular phishing training + simulated phishing tests + clear reporting process', score: 2 },
    ],
  },

  // Access Control (2 questions)
  {
    id: 16, category: 'Access Control',
    question: 'Who has admin access to your critical systems?',
    options: [
      { label: 'Everyone has admin access — it is easier that way', score: 0 },
      { label: 'Only the owner and IT person have admin', score: 1 },
      { label: 'Least-privilege enforced: each person has minimum access needed for their job', score: 2 },
    ],
  },
  {
    id: 17, category: 'Access Control',
    question: 'Do you review third-party app permissions connected to your cloud accounts?',
    options: [
      { label: "We've never checked which apps have access to our Google/M365 accounts", score: 0 },
      { label: 'We checked once when setting up', score: 1 },
      { label: 'Quarterly review: we audit and revoke unused third-party OAuth permissions', score: 2 },
    ],
  },

  // Incident Response (2 questions)
  {
    id: 18, category: 'Incident Response',
    question: 'Do you have a written incident response plan?',
    options: [
      { label: "No — we'll figure it out if something happens", score: 0 },
      { label: 'We have a rough plan in someone\'s head', score: 1 },
      { label: 'Documented plan: who to call, how to isolate, where backups are, when to notify customers', score: 2 },
    ],
  },
  {
    id: 19, category: 'Incident Response',
    question: 'Do you have cyber insurance?',
    options: [
      { label: 'No, and we have not looked into it', score: 0 },
      { label: 'We are researching options', score: 1 },
      { label: 'Yes — policy is active and we review coverage annually', score: 2 },
    ],
  },

  // Physical & Environmental (1 question)
  {
    id: 20, category: 'Physical & Environmental',
    question: 'How do you protect physical access to your business equipment?',
    options: [
      { label: 'Office is unlocked during business hours — anyone can walk in', score: 0 },
      { label: 'Door is locked but no additional physical security', score: 1 },
      { label: 'Access control + server room locked + visitor log + shredder for sensitive documents', score: 2 },
    ],
  },
];

const categories = Array.from(new Set(questions.map((q) => q.category)));

function getCategoryResult(
  cat: string,
  answers: Record<number, number>,
  catQuestions: Question[]
): CategoryResult {
  const scored = catQuestions.filter((q) => answers[q.id] !== undefined);
  const score = scored.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  const maxScore = scored.length * 2;

  // All questions in this category must be answered
  if (scored.length === 0) {
    return {
      name: cat,
      score: 0,
      maxScore: 0,
      percentage: 0,
      status: 'critical',
      advice: 'Not yet assessed.',
    };
  }

  const percentage = Math.round((score / maxScore) * 100);

  let status: CategoryResult['status'];
  let advice: string;
  let guideLink: CategoryResult['guideLink'] | undefined;

  switch (cat) {
    case 'Passwords & Authentication':
      if (percentage >= 80) { status = 'good'; advice = 'Your password practices are strong. Ensure backup admins exist and review the offboarding process quarterly.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'Good start. Your next move: enable 2FA on every account that supports it — not just email. Deploy hardware security keys for all admins.'; guideLink = { text: 'Read: Free Security Tools Guide', url: '/blog/free-security-tools/' }; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Password reuse is your biggest vulnerability right now. Install Bitwarden (free) today for everyone. Enable 2FA on email and banking accounts immediately.'; guideLink = { text: 'Read: Cybersecurity 101', url: '/blog/cybersecurity-101/' }; }
      else { status = 'critical'; advice = 'You are one password breach away from disaster. Stop everything and: (1) set up Bitwarden for everyone, (2) enable 2FA on email, (3) change all reused passwords. Do this today.'; guideLink = { text: 'Read: Cybersecurity 101', url: '/blog/cybersecurity-101/' }; }
      break;

    case 'Backups & Recovery':
      if (percentage >= 80) { status = 'good'; advice = 'Solid backup posture. Test a full restore from your immutable backup once this quarter, and verify offsite copies are current.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'You have backups, which is good — but are they ransomware-proof? Set up immutable backups (Veeam free) and store one copy offsite. Then test a restore.'; guideLink = { text: 'Read: Ransomware Protection Guide', url: '/blog/ransomware-protection/' }; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Without tested backups, ransomware could destroy your business overnight. Set up automated daily backups to both cloud and local storage, then schedule a restore test.'; guideLink = { text: 'Read: Ransomware Protection Guide', url: '/blog/ransomware-protection/' }; }
      else { status = 'critical'; advice = 'No backups = no safety net. Start with Backblaze ($5/device/month) or Veeam Community Edition (free) today. The 3-2-1 rule: 3 copies, 2 media types, 1 offsite.'; guideLink = { text: 'Read: Ransomware Protection Guide', url: '/blog/ransomware-protection/' }; }
      break;

    case 'Network Security':
      if (percentage >= 80) { status = 'good'; advice = 'Your network is well-configured. Next: run an external vulnerability scan with Nessus Essentials (free) to verify no ports are accidentally exposed.'; guideLink = { text: 'Read: VPN vs Zero Trust', url: '/blog/vpn-vs-zerotrust/' }; }
      else if (percentage >= 50) { status = 'ok'; advice = 'Decent baseline but attack surface could be reduced. Priority: set up a guest Wi-Fi network (free, 5 min), disable UPnP on your router, and scan for exposed ports.'; guideLink = { text: 'Read: VPN vs Zero Trust', url: '/blog/vpn-vs-zerotrust/' }; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Your network is likely visible to attackers. Replace ISP router defaults with strong passwords, create separate networks for business vs. guest, and disable RDP exposure immediately.'; guideLink = { text: 'Read: Remote Work Security', url: '/blog/remote-work-security/' }; }
      else { status = 'critical'; advice = 'Your network is wide open. Immediate actions: (1) change router admin password from default, (2) disable RDP/port forwarding, (3) create separate Wi-Fi for business. Consider a Ubiquiti Dream Router ($199) for easy, secure setup.'; guideLink = { text: 'Read: Security Hardware Guide', url: '/blog/essential-security-hardware/' }; }
      break;

    case 'Devices & Endpoints':
      if (percentage >= 80) { status = 'good'; advice = 'Devices are well-managed. Ensure you have a device inventory spreadsheet updated quarterly — you cannot protect what you do not know you have.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'Some good practices in place. Priorities: enable full disk encryption on every laptop (free, built into Windows and Mac) and turn on automatic OS updates.'; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Your devices are vulnerable. Enable BitLocker (Windows) or FileVault (Mac) today. Set auto-updates on. If employees use personal devices, enforce minimum security requirements.'; guideLink = { text: 'Read: Security Hardware Guide', url: '/blog/essential-security-hardware/' }; }
      else { status = 'critical'; advice = 'Any lost or stolen laptop exposes all your business data. Turn on full disk encryption immediately (free, takes 10 minutes per device). Enable screen lock after 5 minutes.'; }
      break;

    case 'Email Security':
      if (percentage >= 80) { status = 'good'; advice = 'Email is well-defended. Run a quarterly simulated phishing test with Curricula (free) to keep skills sharp. Review email forwarding rules for compromise.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'You have some protection but phishing is still a threat. Set up DKIM and DMARC (free through your DNS provider). Run a phishing awareness session with your team.'; guideLink = { text: 'Read: Phishing Prevention Guide', url: '/blog/phishing-prevention/' }; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Email is a primary attack vector and yours is under-defended. Check SPF/DKIM/DMARC at MXToolbox.com. Schedule a 15-minute phishing training for your whole team.'; guideLink = { text: 'Read: Phishing Prevention Guide', url: '/blog/phishing-prevention/' }; }
      else { status = 'critical'; advice = 'Your email is open to spoofing and your team is untrained against phishing — the most common attack. Set up SPF immediately (5 min), then schedule phishing training this week.'; guideLink = { text: 'Read: Phishing Prevention Guide', url: '/blog/phishing-prevention/' }; }
      break;

    case 'Access Control':
      if (percentage >= 80) { status = 'good'; advice = 'Access controls are well-implemented. Review admin accounts quarterly — remove any that are no longer needed. Audit third-party app permissions every quarter.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'You limit some access but there is room to tighten. Audit who has admin rights to every critical system — revoke any that are not absolutely necessary.'; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Too many people have too much access. Apply least-privilege: each person should only have access to what they need for their job. Create separate admin accounts for elevated tasks.'; guideLink = { text: 'Read: Security Audit Checklist', url: '/blog/security-audit-checklist/' }; }
      else { status = 'critical'; advice = 'If everyone is an admin, one compromised account compromises everything. Restrict admin access to 1–2 designated people today. Use separate admin accounts for elevated tasks.'; guideLink = { text: 'Read: Security Audit Checklist', url: '/blog/security-audit-checklist/' }; }
      break;

    case 'Incident Response':
      if (percentage >= 80) { status = 'good'; advice = 'You are ready to respond. Review and update your IR plan quarterly. Run a tabletop exercise: "What if ransomware hits right now?" with your team.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'Good start. Formalize your plan: write down who to call, how to isolate infected machines, where backups are, and when to notify customers. Print it and keep it offline.'; guideLink = { text: 'Read: Cybersecurity 101', url: '/blog/cybersecurity-101/' }; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Without a plan, a real incident will cause panic and expensive mistakes. Write a one-page IR plan this week: who does what, who to call, how to restore from backups.'; }
      else { status = 'critical'; advice = 'You are flying blind. At minimum: write down your backup restore procedure, your insurance contact, and a key IT support phone number. Store it somewhere you can access without your computer.'; }
      break;

    case 'Physical & Environmental':
      if (percentage >= 80) { status = 'good'; advice = 'Physical security is solid. Verify that sensitive paper documents are shredded (cross-cut), not trashed. Review physical access log if you keep one.'; }
      else if (percentage >= 50) { status = 'ok'; advice = 'Reasonable baseline. Add a cross-cut shredder ($50) for documents with customer data. Ensure server/network equipment is in a locked room or closet.'; }
      else if (percentage >= 25) { status = 'poor'; advice = 'Physical access to your equipment and documents is too easy. Lock your server room. Buy a shredder. Consider who has keys and whether former employees still have them.'; }
      else { status = 'critical'; advice = 'Anyone could walk in and access your equipment or documents. Basic fixes: keep the office door locked, put network equipment in a locked room, buy a cross-cut shredder for sensitive papers.'; }
      break;

    default:
      status = 'critical';
      advice = 'Not yet assessed.';
  }

  return { name: cat, score, maxScore, percentage, status, advice, guideLink };
}

export default function SecurityAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAnswer = (score: number) => {
    setAnswers((prev) => ({ ...prev, [questions[currentStep].id]: score }));
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const totalScore = useMemo(
    () => Object.values(answers).reduce((sum, s) => sum + s, 0),
    [answers]
  );
  const totalQuestionsAnswered = Object.keys(answers).length;
  const maxScore = questions.length * 2;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const categoryResults = useMemo(() => {
    return categories.map((cat) => {
      const catQuestions = questions.filter((q) => q.category === cat);
      return getCategoryResult(cat, answers, catQuestions);
    });
  }, [answers]);

  const getOverallRisk = (pct: number) => {
    if (pct >= 85) return { level: 'Excellent — Well Protected', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', icon: '🟢', summary: 'Your security posture is strong. You have the fundamentals in place and are ahead of most small businesses. Your focus now should be continuous improvement: quarterly audits, updated training, and advanced protections like MDR.' };
    if (pct >= 70) return { level: 'Good — Minor Gaps', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', icon: '💚', summary: 'You have most of the basics covered. There are a few specific areas that need attention — focus on the categories marked in yellow and orange below. Fixing these gaps will bring you to a strong security posture.' };
    if (pct >= 50) return { level: 'Moderate Risk — Significant Gaps', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', icon: '🟡', summary: 'You have some good practices but there are important gaps that attackers can exploit. Focus on the red and orange categories first — especially passwords, backups, and email security. These three alone prevent the majority of real-world attacks.' };
    if (pct >= 30) return { level: 'High Risk — Easy Target', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-300', icon: '🟠', summary: 'Your business is an easy target for opportunistic attackers. The good news: most of the fixes are free or low-cost and can be implemented quickly. Start with the critical categories below — work through them one per week until you reach 70%.' };
    return { level: 'Critical Risk — Act Immediately', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300', icon: '🔴', summary: 'Your business is extremely vulnerable. Do not panic, but act today. Most of the fixes needed are free and can be done in an afternoon. Focus on the three most urgent categories below first — those alone will dramatically reduce your risk.' };
  };

  const risk = getOverallRisk(percentage);
  const isComplete = Object.keys(answers).length === questions.length;

  if (!isComplete) {
    const q = questions[currentStep];
    return (
      <div className="mx-auto max-w-2xl">
        {/* Category badge */}
        <div className="mb-2">
          <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            {q.category}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round((currentStep / questions.length) * 100)}% complete</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{q.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(opt.score)}
              className="w-full text-left rounded-xl border-2 border-gray-300 bg-white p-4 hover:border-primary-500 hover:bg-primary-50 hover:shadow-sm transition-all duration-150 cursor-pointer group"
            >
              <span className="text-gray-800 font-medium group-hover:text-primary-700">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Back button */}
        {currentStep > 0 && (
          <button onClick={goBack} className="mt-4 text-sm text-gray-400 hover:text-gray-600 cursor-pointer py-2 px-1">
            &larr; Go back
          </button>
        )}

        {/* Category progress dots */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const catQuestions = questions.filter((q) => q.category === cat);
            const answered = catQuestions.filter((q) => answers[q.id] !== undefined).length;
            const total = catQuestions.length;
            const isActive = cat === q.category;
            return (
              <div
                key={cat}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : answered === total
                    ? 'bg-green-100 text-green-700'
                    : answered > 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {cat} {answered}/{total}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === RESULTS VIEW ===
  const sortedCategories = [...categoryResults].sort((a, b) => a.percentage - b.percentage);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Overall Score */}
      <div className={`rounded-2xl border-2 ${risk.border} ${risk.bg} p-8 text-center mb-10`}>
        <div className="text-6xl mb-4">{risk.icon}</div>
        <div className="text-4xl font-extrabold mb-3">{percentage}%</div>
        <div className={`text-xl font-semibold ${risk.color} mb-4`}>{risk.level}</div>
        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">{risk.summary}</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-white/60 p-3">
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-xs text-gray-600">Questions Answered</div>
          </div>
          <div className="rounded-xl bg-white/60 p-3">
            <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
            <div className="text-xs text-gray-600">Categories Assessed</div>
          </div>
          <div className="rounded-xl bg-white/60 p-3">
            <div className="text-2xl font-bold text-gray-900">{sortedCategories.filter(c => c.status === 'poor' || c.status === 'critical').length}</div>
            <div className="text-xs text-gray-600">Areas Needing Attention</div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <h2 className="text-xl font-bold text-gray-900 mb-5">Detailed Breakdown by Category</h2>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-2 ${
            selectedCategory === null
              ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
              : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          All Categories
        </button>
        {sortedCategories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer border-2 ${
              selectedCategory === cat.name
                ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                : cat.status === 'critical' ? 'bg-white border-red-400 text-red-600 hover:bg-red-50'
                : cat.status === 'poor' ? 'bg-white border-orange-400 text-orange-600 hover:bg-orange-50'
                : cat.status === 'ok' ? 'bg-white border-yellow-400 text-yellow-600 hover:bg-yellow-50'
                : 'bg-white border-green-400 text-green-600 hover:bg-green-50'
            }`}
          >
            {cat.name} {cat.percentage}%
          </button>
        ))}
      </div>

      {/* Category cards */}
      <div className="space-y-4">
        {sortedCategories
          .filter((c) => selectedCategory === null || c.name === selectedCategory)
          .map((cat) => (
            <div
              key={cat.name}
              className={`rounded-xl border-2 p-5 ${
                cat.status === 'critical'
                  ? 'border-red-300 bg-red-50/30'
                  : cat.status === 'poor'
                  ? 'border-orange-300 bg-orange-50/30'
                  : cat.status === 'ok'
                  ? 'border-yellow-300 bg-yellow-50/30'
                  : 'border-green-300 bg-green-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${
                    cat.status === 'critical' ? 'text-red-600'
                    : cat.status === 'poor' ? 'text-orange-600'
                    : cat.status === 'ok' ? 'text-yellow-600'
                    : 'text-green-600'
                  }`}>
                    {cat.percentage}%
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    cat.status === 'critical' ? 'bg-red-100 text-red-700'
                    : cat.status === 'poor' ? 'bg-orange-100 text-orange-700'
                    : cat.status === 'ok' ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                  }`}>
                    {cat.status === 'critical' ? 'Critical' : cat.status === 'poor' ? 'Needs Work' : cat.status === 'ok' ? 'OK' : 'Good'}
                  </span>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-2 rounded-full bg-gray-200 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    cat.status === 'critical' ? 'bg-red-500'
                    : cat.status === 'poor' ? 'bg-orange-500'
                    : cat.status === 'ok' ? 'bg-yellow-500'
                    : 'bg-green-500'
                  }`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Score: {cat.score}/{cat.maxScore}</span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{cat.advice}</p>

              {cat.guideLink && (
                <a
                  href={cat.guideLink.url}
                  className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 no-underline"
                >
                  {cat.guideLink.text} &rarr;
                </a>
              )}
            </div>
          ))}
      </div>

      {/* Priority action plan */}
      <div className="mt-10 rounded-2xl bg-primary-50 border border-primary-200 p-6">
        <h3 className="text-lg font-bold text-primary-900 mb-4">Your Priority Action Plan</h3>
        <div className="space-y-3">
          {sortedCategories.filter(c => c.status === 'critical' || c.status === 'poor').length === 0 ? (
            <p className="text-sm text-primary-800">All categories are at OK level or above. Focus on continuous improvement: quarterly audits, updated training, and monitoring.</p>
          ) : (
            <>
              <p className="text-sm text-primary-800 font-medium">Fix these first — ranked by urgency:</p>
              <ol className="space-y-3">
                {sortedCategories
                  .filter(c => c.status === 'critical' || c.status === 'poor')
                  .map((cat, idx) => (
                    <li key={cat.name} className="flex items-start gap-3 text-sm">
                      <span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                        cat.status === 'critical' ? 'bg-red-600' : 'bg-orange-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-gray-900">{cat.name}</span>
                        <span className="text-gray-600"> — {cat.advice}</span>
                      </div>
                    </li>
                  ))}
              </ol>
              <p className="text-sm text-primary-800 mt-4">Tackle one category per week. Start with #1. Most of these fixes are free and take less than an afternoon.</p>
            </>
          )}
        </div>
      </div>

      {/* Retake button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => { setAnswers({}); setCurrentStep(0); setSelectedCategory(null); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
          Retake Assessment
        </button>
      </div>
    </div>
  );
}
