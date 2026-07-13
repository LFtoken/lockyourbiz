import { useState, useMemo } from 'react';

interface Question {
  id: number;
  question: string;
  options: { label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Do you use the same password across multiple accounts?',
    options: [
      { label: 'Yes, all of them', score: 0 },
      { label: 'A few accounts share passwords', score: 1 },
      { label: 'No, every account has a unique password', score: 2 },
    ],
  },
  {
    id: 2,
    question: 'Do you have two-factor authentication (2FA) enabled on your important accounts?',
    options: [
      { label: "What's 2FA?", score: 0 },
      { label: 'On some accounts', score: 1 },
      { label: 'Yes, on all critical accounts', score: 2 },
    ],
  },
  {
    id: 3,
    question: 'How do you store and share passwords with your team?',
    options: [
      { label: 'Spreadsheet or sticky notes', score: 0 },
      { label: 'Shared document with some protection', score: 1 },
      { label: 'Password manager (1Password, Bitwarden, etc.)', score: 2 },
    ],
  },
  {
    id: 4,
    question: 'How often do you back up your business data?',
    options: [
      { label: 'Never thought about it', score: 0 },
      { label: 'Occasionally, when I remember', score: 1 },
      { label: 'Automated daily/weekly backups', score: 2 },
    ],
  },
  {
    id: 5,
    question: 'Do your employees receive any cybersecurity training?',
    options: [
      { label: "No, we haven't done any training", score: 0 },
      { label: 'We talked about it informally', score: 1 },
      { label: 'Yes, regular security awareness training', score: 2 },
    ],
  },
  {
    id: 6,
    question: 'How do you keep your software and devices updated?',
    options: [
      { label: 'I click "Remind me later" a lot', score: 0 },
      { label: 'Update when something breaks', score: 1 },
      { label: 'Automatic updates enabled everywhere', score: 2 },
    ],
  },
  {
    id: 7,
    question: 'Does your business Wi-Fi have a separate guest network?',
    options: [
      { label: "We just use one Wi-Fi for everything", score: 0 },
      { label: 'We have a password-protected network', score: 1 },
      { label: 'Yes, separate networks for business and guests', score: 2 },
    ],
  },
  {
    id: 8,
    question: 'Do you have a plan for what to do if you get hacked?',
    options: [
      { label: "I'll figure it out when it happens", score: 0 },
      { label: 'I have a rough idea', score: 1 },
      { label: 'Yes, we have a documented incident response plan', score: 2 },
    ],
  },
];

export default function SecurityAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (score: number) => {
    setAnswers((prev) => ({ ...prev, [questions[currentStep].id]: score }));
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const totalScore = useMemo(
    () => Object.values(answers).reduce((sum, s) => sum + s, 0),
    [answers]
  );
  const maxScore = questions.length * 2;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getRiskLevel = (pct: number) => {
    if (pct >= 80) return { level: 'Well Protected', color: 'text-green-600', bg: 'bg-green-50', icon: '🟢', advice: 'Your business has strong security fundamentals. Keep it up — review your incident response plan quarterly and consider a third-party security audit for continuous improvement.' };
    if (pct >= 60) return { level: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '🟡', advice: 'You have some good practices, but there are gaps attackers can exploit. Focus on the red areas in your results — start with enabling 2FA everywhere and getting a password manager.' };
    if (pct >= 40) return { level: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-50', icon: '🟠', advice: 'Your business is an easy target. Prioritize immediate action: get a password manager today, enable 2FA on your email and banking accounts, and set up automated backups.' };
    return { level: 'Critical Risk', color: 'text-red-600', bg: 'bg-red-50', icon: '🔴', advice: 'Your business is extremely vulnerable to cyber attacks. Don\'t panic, but act now. Start with the basics: unique passwords, 2FA, and backups. Our guides below will walk you through each step.' };
  };

  const risk = getRiskLevel(percentage);
  const isComplete = Object.keys(answers).length === questions.length;

  if (!isComplete) {
    const q = questions[currentStep];
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Question {currentStep + 1} of {questions.length}</span>
            <span>{Math.round(((currentStep) / questions.length) * 100)}% complete</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${((currentStep) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-6">{q.question}</h3>

        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAnswer(opt.score)}
              className="w-full text-left rounded-xl border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50 transition-all duration-150 cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className={`rounded-2xl ${risk.bg} p-8 text-center mb-8`}>
        <div className="text-5xl mb-4">{risk.icon}</div>
        <div className="text-3xl font-bold mb-2">{percentage}%</div>
        <div className={`text-xl font-semibold ${risk.color} mb-3`}>{risk.level}</div>
        <p className="text-gray-700 leading-relaxed">{risk.advice}</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Your detailed breakdown:</h4>
        {questions.map((q) => {
          const score = answers[q.id] ?? 0;
          const maxQ = 2;
          return (
            <div key={q.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <span className="text-sm text-gray-700 pr-4">{q.question}</span>
              <span className={`text-sm font-mono font-semibold shrink-0 ${score === 2 ? 'text-green-600' : score === 1 ? 'text-yellow-600' : 'text-red-500'}`}>
                {score}/{maxQ}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => { setAnswers({}); setCurrentStep(0); }}
          className="btn-secondary cursor-pointer"
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );
}
