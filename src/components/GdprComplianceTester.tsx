import { useState, useMemo } from 'react';

interface Question {
  id: number;
  text: string;
  options: { label: string; score: number; detail: string }[];
}

const questions: Question[] = [
  {
    id: 1, text: 'Do you have a privacy policy posted on your website?',
    options: [
      { label: 'Yes, comprehensive and up to date', score: 3, detail: 'Required under GDPR Article 12-14' },
      { label: 'Yes, but it needs updating', score: 1, detail: 'Outdated policies may not satisfy transparency requirements' },
      { label: 'No, I do not have one', score: 0, detail: 'A privacy policy is mandatory — this is the first thing regulators check' },
    ],
  },
  {
    id: 2, text: 'Do you have a cookie consent banner that blocks non-essential cookies until the user agrees?',
    options: [
      { label: 'Yes, with Accept/Reject/Customize options', score: 3, detail: 'GDPR-compliant consent management' },
      { label: 'Yes, but it only informs — does not block cookies', score: 1, detail: 'Informing without blocking is not valid consent under GDPR' },
      { label: 'No cookie banner at all', score: 0, detail: 'Non-essential cookies require prior consent' },
    ],
  },
  {
    id: 3, text: 'Do you collect email addresses or personal data from EU/UK visitors?',
    options: [
      { label: 'No, I do not target EU/UK customers', score: 3, detail: 'GDPR may not apply if you do not target or monitor EU residents' },
      { label: 'Yes, for order fulfillment only', score: 2, detail: 'Contractual necessity is a valid lawful basis, but you still need a privacy policy' },
      { label: 'Yes, for marketing and analytics', score: 1, detail: 'You need explicit consent for marketing — pre-checked boxes are not valid' },
    ],
  },
  {
    id: 4, text: 'How do you handle data access or deletion requests from customers?',
    options: [
      { label: 'We have a documented process and respond within 30 days', score: 3, detail: 'Meets GDPR Article 15-17 requirements for DSARs' },
      { label: 'We would handle it manually if asked', score: 1, detail: 'Lack of documented process creates compliance risk' },
      { label: 'I am not sure what this means', score: 0, detail: 'Data Subject Access Requests are a core GDPR right — you must have a process' },
    ],
  },
  {
    id: 5, text: 'Do you have a data breach notification plan?',
    options: [
      { label: 'Yes, documented and tested', score: 3, detail: 'GDPR requires notification to DPA within 72 hours' },
      { label: 'We have a general idea but nothing written', score: 1, detail: 'Without documentation, you risk missing the 72-hour deadline in a crisis' },
      { label: 'No plan at all', score: 0, detail: 'Failure to notify can multiply penalties significantly' },
    ],
  },
  {
    id: 6, text: 'Do you use third-party services that process customer data (analytics, email marketing, payment processors)?',
    options: [
      { label: 'Yes, and we have Data Processing Agreements with all of them', score: 3, detail: 'DPAs are required under GDPR Article 28' },
      { label: 'Yes, but no formal agreements in place', score: 1, detail: 'You are liable for your processors\' compliance — get DPAs signed' },
      { label: 'No third-party data processors', score: 2, detail: 'Lower risk, but verify — Google Analytics and payment gateways count as processors' },
    ],
  },
  {
    id: 7, text: 'Is customer data encrypted both in transit (HTTPS) and at rest?',
    options: [
      { label: 'Yes, full encryption in transit and at rest', score: 3, detail: 'Encryption is explicitly mentioned in GDPR Article 32 as a security measure' },
      { label: 'HTTPS only, no at-rest encryption', score: 1, detail: 'GDPR requires "appropriate technical measures" — encryption at rest is strongly recommended' },
      { label: 'Not sure', score: 0, detail: 'You need to verify this immediately — it is a basic security requirement' },
    ],
  },
  {
    id: 8, text: 'Do you transfer customer data outside the EU/UK?',
    options: [
      { label: 'No, all data stays in the EU/UK', score: 3, detail: 'Simplest compliance path — no transfer safeguards needed' },
      { label: 'Yes, to countries with adequacy decisions (e.g., UK, Japan)', score: 2, detail: 'Adequacy decisions simplify transfers' },
      { label: 'Yes, to the US or other countries without adequacy status', score: 1, detail: 'You need Standard Contractual Clauses (SCCs) or other transfer safeguards' },
    ],
  },
];

export default function GdprComplianceTester() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [stage, setStage] = useState<'intro' | 'quiz' | 'results'>('intro');

  const score = useMemo(() => {
    const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
    return { raw: total, max: questions.length * 3, pct: Math.round((total / (questions.length * 3)) * 100) };
  }, [answers]);

  const riskLevel = score.pct >= 80 ? { label: 'Low Risk — GDPR Ready', color: 'text-accent-700 bg-accent-50', icon: '🟢' }
    : score.pct >= 50 ? { label: 'Medium Risk — Needs Work', color: 'text-orange-700 bg-orange-50', icon: '🟡' }
    : { label: 'High Risk — Action Required', color: 'text-red-700 bg-red-50', icon: '🔴' };

  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  if (stage === 'intro') return (
    <div className="text-center">
      <div className="text-5xl mb-4">🇪🇺</div>
      <h2 className="text-2xl font-bold text-gray-900">GDPR Compliance Score Tester</h2>
      <p className="mt-3 text-gray-600 max-w-lg mx-auto">
        Answer 8 questions about your data handling practices. Get an instant GDPR readiness score with specific recommendations — free, no sign-up.
      </p>
      <button onClick={() => setStage('quiz')} className="mt-6 btn-primary cursor-pointer min-h-[44px]">
        Start Assessment →
      </button>
    </div>
  );

  if (stage === 'results') return (
    <div>
      <div className={`rounded-xl ${riskLevel.color.split(' ')[1]} p-6 text-center mb-8`}>
        <div className="text-4xl mb-2">{riskLevel.icon}</div>
        <div className={`text-xl font-bold ${riskLevel.color.split(' ')[0]}`}>{riskLevel.label}</div>
        <div className="mt-2 text-3xl font-extrabold text-gray-900">{score.pct}%</div>
        <div className="text-sm text-gray-600">{score.raw}/{score.max} points</div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Your Detailed Results</h3>
      <div className="space-y-3">
        {questions.map(q => {
          const chosen = q.options.find(o => o.score === answers[q.id]);
          const maxOpt = q.options.reduce((a, b) => a.score > b.score ? a : b);
          const isFull = answers[q.id] === maxOpt.score;
          return (
            <div key={q.id} className={`rounded-lg border p-4 ${isFull ? 'border-accent-200 bg-accent-50' : 'border-orange-200 bg-orange-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900">{q.text}</p>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${isFull ? 'bg-accent-200 text-accent-800' : 'bg-orange-200 text-orange-800'}`}>
                  {answers[q.id]}/{maxOpt.score}
                </span>
              </div>
              {chosen && <p className="mt-1 text-xs text-gray-600">{chosen.detail}</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl bg-primary-50 border border-primary-200 p-5">
        <h3 className="font-bold text-primary-900">Next Steps</h3>
        <ul className="mt-2 space-y-1 text-sm text-primary-800">
          <li>• Read our <a href="/compliance/gdpr/" class="underline font-semibold">GDPR Compliance Guide</a></li>
          <li>• Get a <a href="/compliance/compliance-toolkit/" class="underline font-semibold">free privacy policy template</a></li>
          <li>• Browse all <a href="/compliance/" class="underline font-semibold">compliance guides</a></li>
        </ul>
      </div>

      <button onClick={() => { setAnswers({}); setStage('quiz'); }} className="mt-4 w-full btn-secondary cursor-pointer min-h-[44px]">
        Retake Assessment
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-500">Question {Object.keys(answers).length + 1} of {questions.length}</span>
        <div className="h-2 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full transition-all duration-300" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-primary-700">{Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
      </div>

      {questions.filter(q => answers[q.id] === undefined).slice(0, 1).map(q => (
        <div key={q.id}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{q.text}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = { ...answers, [q.id]: opt.score };
                  setAnswers(next);
                  if (Object.keys(next).length === questions.length) setStage('results');
                }}
                className="w-full text-left rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer min-h-[44px]"
              >
                <span className="text-sm font-medium text-gray-900">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
