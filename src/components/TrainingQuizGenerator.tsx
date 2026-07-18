import { useState, useMemo } from 'react';

interface Scenario { topic: string; questions: { q: string; options: string[]; answer: number; explanation: string }[] }

const scenarioData: Record<string, Scenario> = {
  phishing: {
    topic: 'Phishing & Social Engineering Awareness',
    questions: [
      { q: 'You receive an email from your CEO asking you to urgently send a wire transfer to a new vendor. The email address looks correct. What should you do?', options: ['Send the transfer immediately — the CEO said urgent', 'Reply to the email asking for confirmation', 'Call the CEO on a known phone number to verify the request', 'Forward the email to colleagues to see what they think'], answer: 2, explanation: 'Always verify financial requests through a SECOND channel (phone call to known number). CEO email spoofing is the most common BEC attack.' },
      { q: 'An email claims your Microsoft 365 password will expire in 24 hours and provides a link to "keep your current password." What is the right action?', options: ['Click the link and enter your current password to keep it', 'Forward to IT and ask them to handle it', 'Delete the email — it is almost certainly phishing', 'Reply asking for more details'], answer: 2, explanation: 'Microsoft never sends password expiry warnings with clickable links that ask for your current password. This is credential harvesting.' },
      { q: 'You get a LinkedIn message from a recruiter with a link to a "job description PDF." The profile looks legitimate with 500+ connections. What do you do?', options: ['Download and open the PDF — it is just a job description', 'Check the URL carefully, search for the person on Google first', 'Reply and ask them to email it instead', 'Accept the connection and then open it'], answer: 1, explanation: 'Attackers create fake recruiter profiles with stolen photos. PDFs can contain malware. Research the person independently before engaging.' },
      { q: 'A vendor you work with sends an invoice with new bank details, saying they have "changed banks." The email looks like their usual format. What is your response?', options: ['Update the banking details in your system', 'Call your usual contact at the vendor using their known phone number', 'Reply asking them to confirm the new details', 'Pay the invoice to the new account — it is from their email'], answer: 1, explanation: 'Vendor email compromise is surging. Always verify bank detail changes by phone with a known contact — never via email reply.' },
      { q: 'While working from a coffee shop, you need to check your bank account. The cafe WiFi requires a password. Is this safe?', options: ['Yes, the password means it is encrypted and secure', 'No, public WiFi is never safe for sensitive transactions', 'Yes, if I use incognito mode', 'Only if I connect to VPN first'], answer: 3, explanation: 'Even password-protected public WiFi can be intercepted. Always use a VPN or your phone\'s hotspot for sensitive transactions on public networks.' },
    ],
  },
  passwords: {
    topic: 'Password & Access Security',
    questions: [
      { q: 'Which of these passwords is the strongest?', options: ['P@ssword123!', 'Tr0ub4dor&3', 'correct-horse-battery-staple', 'MyDogCharlie2024!'], answer: 2, explanation: 'Length beats complexity. "correct-horse-battery-staple" (28 chars, random words) takes centuries to crack. Short complex passwords are cracked in hours.' },
      { q: 'Your project management app was breached. You used the same password on 5 other sites. What should you do?', options: ['Change the password on the breached app only', 'Change the password on all 6 sites to a new unique one', 'Wait to see if anything happens', 'Add a "1" to the end of your existing password'], answer: 1, explanation: 'Credential stuffing attacks test breached passwords across hundreds of sites. Every reused password is now compromised. Use unique passwords everywhere.' },
      { q: 'What is the best way to manage 50+ unique, strong passwords?', options: ['Write them in a notebook kept in your desk', 'Save them in a password-protected Excel file', 'Use a password manager like Bitwarden or 1Password', 'Use the same base password with site-specific variations'], answer: 2, explanation: 'Password managers generate, store, and auto-fill strong unique passwords. They are more secure than any manual system. Bitwarden is free.' },
      { q: 'Your employee leaves the company. When should you revoke their access to company systems?', options: ['At the end of their notice period', 'Within 24 hours of their last day', 'Immediately upon termination or notification', 'When IT gets around to it'], answer: 2, explanation: 'Access should be revoked immediately. Disgruntled departing employees are a major insider threat vector. Automate deprovisioning if possible.' },
      { q: 'What is "MFA fatigue" and how do you prevent it?', options: ['Getting tired of typing passwords — use a password manager', 'Attackers spamming push notifications until the user accepts — enable number matching', 'Having too many MFA methods — pick one', 'Forgetting your MFA device — keep a backup'], answer: 1, explanation: 'MFA fatigue attacks bombard users with push notifications hoping they will eventually accept. Number matching (typing a code shown on screen) prevents this.' },
    ],
  },
  remote: {
    topic: 'Remote Work & Device Security',
    questions: [
      { q: 'You are working from home. Your teenager uses the same WiFi for gaming. Is this a security risk?', options: ['No, they are just gaming', 'Yes, if your work device is on the same network without segmentation', 'Only if they download games illegally', 'No, home networks are inherently secure'], answer: 1, explanation: 'Home networks mix work devices with gaming PCs, IoT devices, and guest devices — all on the same network. Network segmentation or a separate work VLAN is recommended.' },
      { q: 'Your work laptop prompts you to install a system update. You are in the middle of a project. What do you do?', options: ['Ignore it — updates can wait', 'Schedule the update for the end of the day and restart then', 'Disable automatic updates to prevent interruptions', 'Click "remind me later" indefinitely'], answer: 1, explanation: 'Most critical security patches fix actively exploited vulnerabilities. Schedule updates for end of day, but do not postpone more than 24 hours.' },
      { q: 'You need to send a client file containing sensitive financial data. What is the safest method?', options: ['Email it as an attachment', 'Upload to Google Drive with "Anyone with the link" access', 'Use a secure client portal or encrypted file sharing service', 'Send via WhatsApp or WeChat'], answer: 2, explanation: 'Email attachments are not encrypted end-to-end. "Anyone with the link" means anyone who finds the link can access it. Use services with access controls and encryption.' },
      { q: 'You receive a USB drive at a conference from a vendor. What is the safest approach?', options: ['Plug it into your work computer to see what is on it', 'Plug it into a personal device first to check', 'Never plug unknown USB devices into any computer connected to your work network', 'Ask a colleague to check it first'], answer: 2, explanation: 'USB drops are a real attack vector — malware auto-executes when plugged in. If you must check it, use an air-gapped computer with no network connection.' },
      { q: 'Your phone has work email and Slack on it. It asks to save your password "for convenience." Should you?', options: ['Yes, it saves time', 'Only if the phone has a strong lock screen and biometric unlock', 'No, never save work passwords on mobile devices', 'Only for Slack, not email'], answer: 1, explanation: 'Biometric unlock (fingerprint/face) + strong PIN + remote wipe capability makes mobile access reasonably secure. But the device MUST have these protections enabled.' },
    ],
  },
  data: {
    topic: 'Data Handling & Privacy',
    questions: [
      { q: 'A customer emails you asking what personal data you hold about them. What is your obligation?', options: ['Ignore it — they are being difficult', 'Tell them to check your privacy policy', 'Respond within the legally required timeframe (typically 30 days under GDPR)', 'Delete all their data and say you have nothing'], answer: 2, explanation: 'Under GDPR, CCPA, and other privacy laws, individuals have the right to access their data. You must respond within the specified timeframe with a complete disclosure.' },
      { q: 'You accidentally email a client spreadsheet to the wrong person. The spreadsheet contains customer names and purchase amounts. What should you do?', options: ['Send a follow-up email asking them to delete it', 'Hope they do not notice', 'Assess if this qualifies as a reportable data breach and follow your incident response plan', 'Call them and ask them to delete it'], answer: 2, explanation: 'This is a data breach. Depending on the data types and jurisdiction, you may need to report it to regulators and notify affected customers. Document everything.' },
      { q: 'Your marketing team wants to add everyone from a trade show attendee list to the company newsletter. Can they?', options: ['Yes, they attended the trade show so they opted in', 'Only if the trade show registration included explicit consent for third-party marketing', 'Yes, as long as the emails are "business development"', 'Only if you send them a personal email first'], answer: 1, explanation: 'Purchased or scraped email lists violate GDPR and CAN-SPAM rules. Each recipient must have explicitly consented to receive YOUR marketing emails. Trade show attendance is not consent.' },
      { q: 'An employee is leaving and wants to take their client contact list to their new job. Is this allowed?', options: ['Yes, they built the relationships', 'Only if the contacts are in their personal phone', 'No — client data belongs to the company, and taking it may violate NDAs and data protection laws', 'Only with manager approval'], answer: 2, explanation: 'Client data is company property. Taking it is data theft and may trigger breach notification requirements. Have clear offboarding procedures.' },
      { q: 'You store customer data on a cloud drive. The provider announces a security incident. What should you do first?', options: ['Wait for them to tell you more', 'Immediately move all data to a different provider', 'Assess whether YOUR customers\' data was affected and determine notification obligations', 'Post about it on social media'], answer: 2, explanation: 'Even if the breach is at your cloud provider, YOU may be responsible for notifying YOUR customers. Review your DPA, assess impact, and begin notification if required.' },
    ],
  },
};

export default function TrainingQuizGenerator() {
  const [selectedScenario, setSelectedScenario] = useState<string>('phishing');
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const scenario = scenarioData[selectedScenario];
  const totalQuestions = scenario.questions.length;

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    scenario.questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    return { correct, total: totalQuestions, pct: Math.round((correct / totalQuestions) * 100) };
  }, [answers, submitted, scenario, totalQuestions]);

  const reset = () => { setAnswers({}); setSubmitted(false); setCurrentQ(0); setQuizStarted(false); };

  if (!quizStarted) return (
    <div className="text-center">
      <div className="text-5xl mb-4">📝</div>
      <h2 className="text-2xl font-bold text-gray-900">Employee Security Training Quiz Generator</h2>
      <p className="mt-3 text-gray-600 max-w-lg mx-auto">
        Generate a custom security training quiz for your team. Pick a topic, answer the quiz yourself to see how it works, then use the questions in your next team training session. Free, no sign-up.
      </p>
      <div className="mt-6">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Select Quiz Topic</label>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {Object.entries(scenarioData).map(([key, s]) => (
            <button key={key} onClick={() => setSelectedScenario(key)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all cursor-pointer min-h-[44px] ${selectedScenario === key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              {s.topic}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => setQuizStarted(true)} className="mt-6 btn-primary cursor-pointer min-h-[44px]">
        Start {scenario.topic} Quiz →
      </button>
    </div>
  );

  if (submitted && score) return (
    <div>
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-center mb-6">
        <div className="text-4xl font-extrabold text-primary-700">{score.pct}%</div>
        <div className="text-sm text-gray-600">{score.correct}/{score.total} correct</div>
        <div className="mt-2 text-sm text-gray-500">{scenario.topic}</div>
      </div>

      <h3 className="font-bold text-gray-900 mb-4">Review Your Answers</h3>
      <div className="space-y-3">
        {scenario.questions.map((q, i) => {
          const isCorrect = answers[i] === q.answer;
          return (
            <div key={i} className={`rounded-lg border p-4 ${isCorrect ? 'border-accent-200 bg-accent-50' : 'border-red-200 bg-red-50'}`}>
              <p className="text-sm font-medium text-gray-900">{i + 1}. {q.q}</p>
              <p className="mt-1 text-xs text-gray-600">Your answer: <strong className={isCorrect ? 'text-accent-700' : 'text-red-700'}>{q.options[answers[i]]}</strong></p>
              {!isCorrect && <p className="mt-1 text-xs text-gray-600">Correct: <strong className="text-accent-700">{q.options[q.answer]}</strong></p>}
              <p className="mt-1 text-xs text-gray-500 italic">{q.explanation}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={reset} className="flex-1 btn-secondary cursor-pointer min-h-[44px]">Take Another Quiz</button>
        <button onClick={() => { setAnswers({}); setSubmitted(false); setCurrentQ(0); }} className="flex-1 btn-primary cursor-pointer min-h-[44px]">Retake This Quiz</button>
      </div>
    </div>
  );

  const q = scenario.questions[currentQ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-primary-700">{scenario.topic}</span>
        <span className="text-sm text-gray-500">Q{currentQ + 1}/{totalQuestions}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${((currentQ) / totalQuestions) * 100}%` }} />
      </div>

      <h3 className="text-base font-semibold text-gray-900 mb-4">{q.q}</h3>
      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => {
            const next = { ...answers, [currentQ]: i };
            setAnswers(next);
            if (currentQ + 1 >= totalQuestions) { setSubmitted(true); }
            else { setCurrentQ(currentQ + 1); }
          }}
          className={`w-full text-left rounded-lg border p-4 text-sm hover:border-primary-400 transition-all cursor-pointer min-h-[44px] ${answers[currentQ] === i ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700'}`}>
            <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
