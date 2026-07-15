import { useState, useMemo } from 'react';

interface EmailScenario {
  id: number;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  category: string;
  explanation: {
    title: string;
    flags: { text: string; isRed: boolean }[];
    tip: string;
  };
}

const scenarios: EmailScenario[] = [
  {
    id: 1,
    from: 'service@paypal-account-alert.co',
    fromName: 'PayPal Service',
    subject: '⚠ Your Account Has Been Limited — Immediate Action Required',
    body: `Dear Valued Customer,

We have detected unusual activity on your PayPal account. To protect your account from unauthorized access, we have temporarily limited certain features.

To restore full access to your account, please verify your identity by clicking the link below within 24 hours. Failure to do so will result in permanent account suspension.

[Verify Your Account Now →](https://paypal-verify.account-alert.co/login)

We apologize for any inconvenience this may cause.

Sincerely,
PayPal Security Team`,
    isPhishing: true,
    category: 'Urgency + Fake Link',
    explanation: {
      title: 'This is a phishing email.',
      flags: [
        { text: 'The sender domain is "paypal-account-alert.co" — not paypal.com. Always check the actual domain after the @ symbol.', isRed: true },
        { text: 'Creates false urgency: "within 24 hours" and "permanent account suspension" are designed to make you panic and click without thinking.', isRed: true },
        { text: 'The link goes to "paypal-verify.account-alert.co" — a fake login page designed to steal your credentials. Hover over links to preview the real URL.', isRed: true },
        { text: 'Generic greeting: "Dear Valued Customer" instead of your actual name. PayPal always addresses you by name.', isRed: true },
      ],
      tip: 'Legitimate companies never threaten to close your account via email. If you are unsure, open a new browser tab and log in directly at paypal.com — never click the link in the email.',
    },
  },
  {
    id: 2,
    from: 'drive-shares-noreply@google.com',
    fromName: 'Sarah Chen (via Google Drive)',
    subject: 'Shared: Q3 Marketing Budget Draft — Please Review',
    body: `Sarah Chen shared a file with you in Google Drive.

Sarah says: "Here is the latest draft of the Q3 budget. Can you take a look before the meeting tomorrow? I would love your input on the paid ads section."

📄 Q3_Marketing_Budget_v3.xlsx
Open in Drive →

This file is shared with 3 people in your organization.
Google Drive: Store, share, and access your files from anywhere.`,
    isPhishing: false,
    category: 'Legitimate Sharing Notification',
    explanation: {
      title: 'This is a legitimate email.',
      flags: [
        { text: 'The sender is from @google.com — Google Drive notification emails always come from this official domain.', isRed: false },
        { text: 'No urgency or threat. Sarah asks for feedback "before the meeting tomorrow" — a normal, reasonable timeframe.', isRed: false },
        { text: 'The message references specific, context-rich details: Q3 budget, paid ads section, a known colleague\'s name. Phishing emails are usually vague.', isRed: false },
        { text: 'Google Drive sharing notifications are transactional emails — they confirm an action someone took (sharing a file). They do not ask you to take urgent action.', isRed: false },
      ],
      tip: 'Drive sharing notifications are a common phishing vector because people trust them. The key difference: real ones come from @google.com and reference files you would actually expect from people you actually know. If you were not expecting a file, verify via Slack or a phone call.',
    },
  },
  {
    id: 3,
    from: 'alert@chase-secure-verify.net',
    fromName: 'Chase Bank Security',
    subject: 'URGENT: Suspicious Login Attempt on Your Chase Account',
    body: `Dear Chase Customer,

We detected a login attempt to your Chase business account from an unrecognized device in Moscow, Russia.

Date: July 14, 2026
Time: 3:47 AM EST
IP Address: 185.xxx.xxx.42
Device: Windows 10 / Chrome Browser

If this was not you, you MUST verify your identity immediately to prevent account takeover. Click below to secure your account:

[Secure My Account Now →](https://chase.secure-verify.net/account/login)

If we do not receive verification within 2 hours, your account will be frozen for your protection.

Chase Fraud Protection Team
Reference ID: CHA-98472-SEC`,
    isPhishing: true,
    category: 'Bank Impersonation',
    explanation: {
      title: 'This is a phishing email.',
      flags: [
        { text: 'The domain "chase-secure-verify.net" is not chase.com. Banks only email from their official domain — always.', isRed: true },
        { text: 'The link points to "chase.secure-verify.net" — a fake login page. The real chase.com would be chase.com/verify or similar, not a subdomain on a random domain.', isRed: true },
        { text: 'Extreme urgency with a threat: "2 hours" deadline and "account will be frozen." Banks do not communicate this way.', isRed: true },
        { text: 'Real banks never ask you to click email links to verify identity. They direct you to log in through their app or website independently.', isRed: true },
        { text: 'The reference ID looks official but is completely made up — attackers add these to make emails seem authentic.', isRed: true },
      ],
      tip: 'This is one of the most common and effective phishing types. The rule is simple: NEVER click a link in a bank security alert. Open your bank\'s app or type chase.com directly into your browser. If there is a real alert, it will be in your account notifications.',
    },
  },
  {
    id: 4,
    from: 'auto-confirm@amazon.com',
    fromName: 'Amazon.com',
    subject: 'Your Amazon Order #114-7392841-6629053 Has Shipped',
    body: `Hi [Your Name],

Your order has shipped! Here is what is on the way:

Order #114-7392841-6629053
Shipped on: July 14, 2026

Items:
• Logitech MX Master 3S Wireless Mouse — Qty: 1

Tracking: 1Z999AA10123456784
Carrier: UPS
Estimated delivery: Thursday, July 16

You can track your package at amazon.com/orders or through the Amazon app.

Need to make a return? Visit the Returns Center in Your Orders.

Thank you for shopping with us.
Amazon.com`,
    isPhishing: false,
    category: 'Legitimate Transactional Email',
    explanation: {
      title: 'This is a legitimate email.',
      flags: [
        { text: 'From @amazon.com — the official Amazon domain. Always check the exact sender address.', isRed: false },
        { text: 'No links to click. It tells you to go to amazon.com/orders or use the app — exactly what a legitimate company does.', isRed: false },
        { text: 'Contains a specific, real-looking order number and tracking number. Phishing emails usually have generic references.', isRed: false },
        { text: 'References a specific product you would remember ordering. Transactional emails confirm something that actually happened.', isRed: false },
        { text: 'No urgency, no threat, no request for personal information. Just an informational notification.', isRed: false },
      ],
      tip: 'Transactional emails (order confirmations, shipping notices, receipts) are generally safe. But attackers DO send fake shipping notifications — the giveaway is usually a suspicious tracking link or an attachment (real shipping emails rarely have attachments).',
    },
  },
  {
    id: 5,
    from: 'david.wilson@company-email.net',
    fromName: 'David Wilson, CEO',
    subject: 'Quick favor — need gift cards for client meeting',
    body: `Hi,

Are you available right now? I need you to handle something quickly before my next meeting at 2pm.

I am with a client and need 5 x $200 Amazon gift cards for a thank-you gesture. I would do it myself but I am stuck in presentations all morning.

Please purchase them and send me photos of the codes. I will reimburse you immediately — just forward the receipt.

Let me know when you have them. This is urgent.

Best,
David Wilson
CEO
Sent from my iPhone`,
    isPhishing: true,
    category: 'CEO Impersonation (BEC)',
    explanation: {
      title: 'This is a phishing email — specifically a Business Email Compromise (BEC) attack.',
      flags: [
        { text: 'The sender domain "company-email.net" is NOT your actual company domain. This is the biggest red flag — always check the domain, not just the display name.', isRed: true },
        { text: 'Unusual request: a CEO asking for gift cards via email. This is the #1 BEC scenario. Attackers know the CEO\'s name and use it to pressure employees.', isRed: true },
        { text: 'Creates urgency and social pressure: "before my next meeting," "I am with a client," "This is urgent." All designed to short-circuit your judgment.', isRed: true },
        { text: 'Requests photos of gift card codes — once sent, the money is gone and untraceable. This is the specific ask in nearly every BEC attack.', isRed: true },
        { text: '"Sent from my iPhone" — attackers add this to excuse brevity and typos. A real CEO would call or Slack you for something this unusual.', isRed: true },
      ],
      tip: 'Gift card requests via email are ALWAYS a scam. No exceptions. If you get one, do not reply to the email — contact the person directly through a different channel (phone call, Slack, walk over to their desk). This single habit prevents the most financially damaging type of phishing.',
    },
  },
  {
    id: 6,
    from: 'it-notifications@yourcompany.com',
    fromName: 'IT Department',
    subject: 'Password Expiration Notice — Action Required by Friday',
    body: `Hello,

This is an automated reminder from the IT department.

Your company account password will expire in 3 days on Friday, July 17. Please reset it before then to avoid losing access to your email, file shares, and internal tools.

How to reset:
• Go to portal.office.com (type this in your browser — do not use a link)
• Sign in with your work account
• Go to Settings → Password → Change Password

Your new password must be at least 12 characters and different from your last 3 passwords.

If you have already reset your password this week, you can ignore this message.

Questions? Reply to this email or call IT at x4500.

Thanks,
IT Support Team`,
    isPhishing: false,
    category: 'Legitimate Internal Communication',
    explanation: {
      title: 'This is a legitimate email.',
      flags: [
        { text: 'From @yourcompany.com — matches your actual company domain. Internal IT emails come from your own domain.', isRed: false },
        { text: 'No clickable link — it tells you to TYPE "portal.office.com" in your browser. Real IT departments do this to build good security habits.', isRed: false },
        { text: 'Reasonable timeframe: "expires in 3 days" is normal for password policies. Not "expires in 2 hours" which would be suspicious.', isRed: false },
        { text: 'Specific, verifiable instructions: portal.office.com is the real Microsoft 365 login, and the path (Settings → Password) is accurate.', isRed: false },
        { text: 'Includes alternative verification channels: reply to the email OR call IT at x4500. Attackers never want you to verify through another channel.', isRed: false },
      ],
      tip: 'Good internal IT emails tell you where to go without making you click a link. But be careful — sophisticated attackers can spoof internal domains. If the email ever asks you to click a link to a login page, verify with IT first. The safest habit: always type the URL yourself.',
    },
  },
  {
    id: 7,
    from: 'accounts@wilson-construction-firm.com',
    fromName: 'Wilson Construction — Accounts Payable',
    subject: 'Invoice #INV-2026-0742 — Overdue Payment Notice',
    body: `Dear Accounts Payable Department,

This is a follow-up regarding the attached invoice #INV-2026-0742 for services completed at your downtown office location last month.

Invoice Details:
• Invoice #: INV-2026-0742
• Amount: $4,850.00
• Due Date: July 1, 2026 (now 14 days past due)
• Services: HVAC system inspection and filter replacement

Please review the attached invoice and remit payment at your earliest convenience. Continued non-payment may result in late fees as outlined in our service agreement.

[📎 INV-2026-0742.pdf]

If payment has already been made, please disregard this notice and accept our thanks.

Regards,
Maria Rodriguez
Accounts Receivable
Wilson Construction Services`,
    isPhishing: true,
    category: 'Fake Invoice Scam',
    explanation: {
      title: 'This is a phishing email with a malicious attachment.',
      flags: [
        { text: 'You have never heard of Wilson Construction and have no record of HVAC work at your office. Unexpected invoices are a major red flag — especially with attachments.', isRed: true },
        { text: 'The PDF attachment is almost certainly malware. Opening it could install ransomware or a keylogger. Never open attachments from unknown senders.', isRed: true },
        { text: 'Pressure to act: "overdue," "late fees," "14 days past due." Scammers use fake urgency to make you open the attachment without verifying.', isRed: true },
        { text: 'Generic greeting: "Dear Accounts Payable Department" — if they did real work for you, they would know your name and have your direct contact.', isRed: true },
        { text: 'Vague service description: "HVAC system inspection and filter replacement" is generic enough to apply to almost any business with an office.', isRed: true },
      ],
      tip: 'Invoice fraud is the most common email threat for businesses. The rule: never open an attachment or pay an invoice from a vendor you do not recognize. Forward it to whoever handles your accounts payable and have them verify independently. A real vendor with an overdue invoice will call you.',
    },
  },
  {
    id: 8,
    from: 'trackingupdates@fedex.com',
    fromName: 'FedEx Tracking',
    subject: 'Your Package from Staples is Out for Delivery — Track #784392718903',
    body: `Hi,

Your package from Staples, Inc. is on the delivery vehicle and scheduled for delivery today, July 15, by 4:30 PM.

Tracking Number: 784392718903
Service: FedEx Ground
Reference: Staples Order #STP-88219

Estimated Delivery Window: 1:15 PM — 4:30 PM
Signature Required: No

You can track your package at fedex.com/tracking or through the FedEx mobile app.

Manage your delivery at fedex.com/delivery:
• Hold at FedEx location
• Deliver to a neighbor
• Provide delivery instructions

Thank you for choosing FedEx.`,
    isPhishing: false,
    category: 'Legitimate Shipping Notification',
    explanation: {
      title: 'This is a legitimate email.',
      flags: [
        { text: 'From trackingupdates@fedex.com — the official FedEx domain for tracking notifications. Always verify the domain is exactly fedex.com.', isRed: false },
        { text: 'No clickable link to a login page. It directs you to fedex.com/tracking — a real page where you manually enter a tracking number.', isRed: false },
        { text: 'Specific, verifiable details: real tracking number format, specific sender (Staples), reference order number. These are transaction-specific.', isRed: false },
        { text: 'No request for payment, personal information, or account credentials. Just a delivery notification.', isRed: false },
        { text: 'Reasonable delivery window and delivery management options match exactly what FedEx actually offers.', isRed: false },
      ],
      tip: 'Fake shipping notification emails are common — especially during the holidays. The fakes usually include a "tracking link" that goes to a lookalike domain (like fedex-tracking.co) or ask you to "confirm delivery details" by logging in. Real shipping emails just give you the tracking number and tell you to go to the website yourself.',
    },
  },
  {
    id: 9,
    from: 'prizes@lucky-draw-rewards.com',
    fromName: 'Walmart Customer Rewards',
    subject: '🎉 CONGRATULATIONS! You Won Our Monthly $1,000 Gift Card Drawing!',
    body: `CONGRATULATIONS!

Your email address was randomly selected as the WINNER of our monthly $1,000 Walmart Gift Card Drawing!

You have been selected to receive a $1,000 Walmart e-Gift Card — absolutely free!

To claim your prize, simply complete the form at the link below. You have 48 hours to claim, or your prize will be forfeited to the runner-up.

[Claim Your $1,000 Gift Card Here →](https://walmart.rewards-claim-center.com/winner?id=88291)

All we need from you:
• Full name and shipping address
• Phone number
• Date of birth

This is NOT a subscription or trial. There is NO purchase required. This is a genuine prize.

Congratulations again!
Walmart Customer Rewards Team`,
    isPhishing: true,
    category: 'Prize/Too-Good-To-Be-True',
    explanation: {
      title: 'This is a phishing email.',
      flags: [
        { text: 'The sender domain "lucky-draw-rewards.com" has nothing to do with Walmart. Real corporate emails come from the company\'s actual domain.', isRed: true },
        { text: 'Prize emails you did not enter to win are always scams. You cannot win a contest you never entered.', isRed: true },
        { text: 'Requests excessive personal information: full name, address, phone number, date of birth — everything needed for identity theft.', isRed: true },
        { text: 'Over-the-top promises: "$1,000 absolutely free" + "no purchase required" + "genuine prize." The more a scam protests it is real, the less real it is.', isRed: true },
        { text: '48-hour deadline pressure to claim before you "forfeit." This prevents you from thinking it through or asking someone else.', isRed: true },
        { text: 'The link goes to "walmart.rewards-claim-center.com" — a fake domain. Real Walmart links go to walmart.com.', isRed: true },
      ],
      tip: 'The "too good to be true" test is the simplest and most effective phishing detection tool. If an unsolicited email promises you free money, prizes, or exclusive deals, it is a scam — 100% of the time. Delete and move on.',
    },
  },
  {
    id: 10,
    from: 'notifications-noreply@linkedin.com',
    fromName: 'LinkedIn Notifications',
    subject: 'You have a new connection request from Michael Torres',
    body: `Hi [Your Name],

Michael Torres wants to connect with you on LinkedIn.

Michael Torres
Chief Technology Officer at TechVentures Partners
San Francisco Bay Area · 500+ connections

"You work in a similar space and I would love to add you to my professional network."

[Accept]   [Ignore]

You can manage your connection requests at linkedin.com/mynetwork.

This notification was sent to [your email]. Unsubscribe from these types of notifications.

LinkedIn Corporation, 1000 W Maude Ave, Sunnyvale, CA 94085`,
    isPhishing: false,
    category: 'Legitimate Social Media Notification',
    explanation: {
      title: 'This is a legitimate email.',
      flags: [
        { text: 'From notifications-noreply@linkedin.com — real LinkedIn notification emails come from exactly this address.', isRed: false },
        { text: 'Transactional notification: it is confirming an action someone took (sending a connection request). It is not asking you to do anything urgent.', isRed: false },
        { text: 'Includes standard LinkedIn footer elements: unsubscribe link, corporate address. These are legally required for legitimate marketing emails.', isRed: false },
        { text: 'No request for login, password reset, or personal information. Just a notification of an event on the platform.', isRed: false },
      ],
      tip: 'Social media notifications are commonly faked. The red flags in a fake would be: a link asking you to log in to "view" the request, a sender from a non-LinkedIn domain, or urgency like "your account will be deleted." When in doubt, open the app directly instead of clicking email links.',
    },
  },
];

type Stage = 'intro' | 'quiz' | 'feedback' | 'results';

export default function PhishingQuiz() {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'legitimate' | 'phishing'>>({});
  const [lastAnswer, setLastAnswer] = useState<'legitimate' | 'phishing' | null>(null);

  const totalQuestions = scenarios.length;
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (choice: 'legitimate' | 'phishing') => {
    setAnswers((prev) => ({ ...prev, [scenarios[currentQuestion].id]: choice }));
    setLastAnswer(choice);
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setLastAnswer(null);
      setStage('quiz');
    } else {
      setStage('results');
    }
  };

  const handleBack = () => {
    if (stage === 'feedback') {
      setLastAnswer(null);
      setStage('quiz');
    }
  };

  // Score calculations
  const results = useMemo(() => {
    let correct = 0;
    let missedPhishing = 0;
    let falsePositive = 0;
    let correctPhishing = 0;
    let correctLegitimate = 0;

    const categoryStats: Record<string, { total: number; correct: number; isPhish: boolean }> = {};

    scenarios.forEach((s) => {
      const userAnswer = answers[s.id];
      if (userAnswer === undefined) return;

      const isCorrect =
        (userAnswer === 'phishing' && s.isPhishing) ||
        (userAnswer === 'legitimate' && !s.isPhishing);

      if (isCorrect) {
        correct++;
        if (s.isPhishing) correctPhishing++;
        else correctLegitimate++;
      } else {
        if (s.isPhishing) missedPhishing++;
        else falsePositive++;
      }

      if (!categoryStats[s.category]) {
        categoryStats[s.category] = { total: 0, correct: 0, isPhish: s.isPhishing };
      }
      categoryStats[s.category].total++;
      if (isCorrect) categoryStats[s.category].correct++;
    });

    return {
      correct,
      total: answeredCount,
      percentage: answeredCount > 0 ? Math.round((correct / answeredCount) * 100) : 0,
      missedPhishing,
      falsePositive,
      correctPhishing,
      correctLegitimate,
      categoryStats,
    };
  }, [answers]);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'Phishing Expert 🏆', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300', summary: 'You have a sharp eye. You correctly identified nearly all the phishing and legitimate emails. Share this quiz with your team — they could learn from your results.' };
    if (pct >= 70) return { label: 'Above Average 👍', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300', summary: 'Good instincts. You caught most of the phishing attempts but missed one or two. Focus on the categories where you made mistakes — those are the patterns real attackers use most.' };
    if (pct >= 50) return { label: 'Room for Improvement 📖', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-300', summary: 'You spotted some threats but missed others. The good news: phishing detection is a skill you can build quickly. Review the explanations for the emails you got wrong — those specific tells will stick with you.' };
    return { label: 'Needs Practice 🎯', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300', summary: 'You are exactly who phishing attacks are designed to fool — and that is okay, because now you know. Go back through each explanation carefully. The patterns you learn here will protect you and your business going forward.' };
  };

  const grade = getGrade(results.percentage);

  // === INTRO STAGE ===
  if (stage === 'intro') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎣</div>
          <h2 className="text-3xl font-extrabold text-gray-900">Can You Spot a Phishing Email?</h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            10 emails. Some are real, some are scams. Can you tell the difference?
          </p>
        </div>

        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6 mb-8">
          <p className="text-sm font-semibold text-yellow-800">Why This Matters</p>
          <p className="mt-2 text-sm text-yellow-700">
            91% of cyberattacks start with a phishing email. The average small business employee receives 14 phishing emails per month. But here is the thing: <strong>once you know the patterns, most phishing emails are obvious.</strong> This quiz teaches you those patterns — using emails that look and feel real.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-3xl mb-2">📧</div>
            <div className="text-2xl font-bold text-gray-900">10</div>
            <div className="text-xs text-gray-500 mt-1">Realistic Emails</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-2xl font-bold text-gray-900">5 min</div>
            <div className="text-xs text-gray-500 mt-1">To Complete</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className="text-3xl mb-2">🎓</div>
            <div className="text-2xl font-bold text-gray-900">Learn</div>
            <div className="text-xs text-gray-500 mt-1">After Each Answer</div>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
          <ol className="text-sm text-gray-700 space-y-2">
            <li><strong>1.</strong> We will show you 10 emails, one at a time — some are real business emails, some are phishing attempts.</li>
            <li><strong>2.</strong> For each one, decide: <strong>Legitimate</strong> or <strong>Phishing</strong>?</li>
            <li><strong>3.</strong> After each answer, we will break down exactly what gave it away (or what made it safe) — with the specific red flags and green flags highlighted.</li>
            <li><strong>4.</strong> At the end, you will get your score plus a breakdown of which phishing types you are good at spotting and which ones you need to watch for.</li>
          </ol>
        </div>

        <div className="text-center">
          <button
            onClick={() => setStage('quiz')}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-700 transition-all duration-200 cursor-pointer"
          >
            Start the Quiz
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </button>
          <p class="mt-3 text-xs text-gray-400">No sign-up. Nothing leaves your browser.</p>
        </div>
      </div>
    );
  }

  // === QUIZ STAGE ===
  if (stage === 'quiz') {
    const scenario = scenarios[currentQuestion];
    return (
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Email {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round((currentQuestion / totalQuestions) * 100)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          Is this email <span className="text-green-600">Legitimate</span> or <span className="text-red-600">Phishing</span>?
        </h3>

        {/* Email mockup */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm mb-6">
          {/* Email header bar */}
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>📧 Email Preview</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-gray-500 shrink-0 w-10 text-right text-xs">From:</span>
                <span className="font-medium text-gray-900">{scenario.fromName}</span>
                <span className="text-gray-400 text-xs">&lt;{scenario.from}&gt;</span>
              </div>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-gray-500 shrink-0 w-10 text-right text-xs">Subject:</span>
                <span className="font-semibold text-gray-900">{scenario.subject}</span>
              </div>
            </div>
          </div>
          {/* Email body */}
          <div className="px-5 py-4">
            <div
              className="text-sm text-gray-800 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: scenario.body
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="text-blue-600 underline">$1</span>'),
              }}
            />
          </div>
        </div>

        {/* Choice buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer('legitimate')}
            className="rounded-xl border-3 border-green-400 bg-white px-6 py-5 text-center hover:bg-green-50 hover:border-green-500 hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="text-lg font-bold text-green-700">Legitimate</div>
            <div className="text-xs text-gray-500 mt-1">This is a real, safe email</div>
          </button>
          <button
            onClick={() => handleAnswer('phishing')}
            className="rounded-xl border-3 border-red-400 bg-white px-6 py-5 text-center hover:bg-red-50 hover:border-red-500 hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <div className="text-3xl mb-2">🚩</div>
            <div className="text-lg font-bold text-red-700">Phishing</div>
            <div className="text-xs text-gray-500 mt-1">This is a scam or fake email</div>
          </button>
        </div>
      </div>
    );
  }

  // === FEEDBACK STAGE ===
  if (stage === 'feedback') {
    const scenario = scenarios[currentQuestion];
    const userAnswer = lastAnswer;
    const isCorrect =
      (userAnswer === 'phishing' && scenario.isPhishing) ||
      (userAnswer === 'legitimate' && !scenario.isPhishing);

    return (
      <div className="mx-auto max-w-2xl">
        {/* Result banner */}
        <div className={`rounded-2xl border-2 p-6 text-center mb-6 ${
          isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        }`}>
          <div className="text-5xl mb-3">{isCorrect ? '🎉' : '😬'}</div>
          <div className={`text-2xl font-extrabold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? 'You Got It Right!' : 'Not Quite'}
          </div>
          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect
              ? `This email is indeed ${scenario.isPhishing ? 'a phishing attempt' : 'legitimate'}.`
              : `This email is actually ${scenario.isPhishing ? 'a phishing attempt' : 'legitimate'} — not what you selected.`}
          </p>
        </div>

        {/* Explanation */}
        <div className={`rounded-2xl border-2 p-6 mb-6 ${
          scenario.isPhishing ? 'border-red-300 bg-red-50/30' : 'border-green-300 bg-green-50/30'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${
            scenario.isPhishing ? 'text-red-800' : 'text-green-800'
          }`}>
            {scenario.explanation.title}
          </h3>

          <div className="space-y-3">
            {scenario.explanation.flags.map((flag, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className={`shrink-0 mt-0.5 text-lg ${flag.isRed ? '' : ''}`}>
                  {flag.isRed ? '🔴' : '🟢'}
                </span>
                <p className={`text-sm leading-relaxed ${flag.isRed ? 'text-red-800 font-medium' : 'text-green-800'}`}>
                  {flag.text}
                </p>
              </div>
            ))}
          </div>

          <div className={`mt-5 rounded-xl p-4 border ${
            scenario.isPhishing ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'
          }`}>
            <p className="text-sm font-semibold text-gray-900 mb-1">💡 Key Takeaway</p>
            <p className="text-sm text-gray-800">{scenario.explanation.tip}</p>
          </div>
        </div>

        {/* Category tag */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-gray-500">Pattern Type:</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            scenario.isPhishing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {scenario.category}
          </span>
          {scenario.isPhishing && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">PHISHING</span>
          )}
          {!scenario.isPhishing && (
            <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">LEGITIMATE</span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer py-2 px-1"
          >
            &larr; Change answer
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-primary-700 transition-all duration-200 cursor-pointer min-h-[44px]"
          >
            {currentQuestion < totalQuestions - 1 ? (
              <>
                Next Email
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </>
            ) : (
              'See Your Results'
            )}
          </button>
        </div>
      </div>
    );
  }

  // === RESULTS STAGE ===
  if (stage === 'results') {
    const phishingTypes = ['Urgency + Fake Link', 'Bank Impersonation', 'CEO Impersonation (BEC)', 'Fake Invoice Scam', 'Prize/Too-Good-To-Be-True'];
    const legitTypes = ['Legitimate Sharing Notification', 'Legitimate Transactional Email', 'Legitimate Internal Communication', 'Legitimate Shipping Notification', 'Legitimate Social Media Notification'];

    const missedPhishingCategories = Object.entries(results.categoryStats)
      .filter(([, stats]) => stats.isPhish && stats.correct < stats.total)
      .map(([cat]) => cat);

    const missedLegitCategories = Object.entries(results.categoryStats)
      .filter(([, stats]) => !stats.isPhish && stats.correct < stats.total)
      .map(([cat]) => cat);

    return (
      <div className="mx-auto max-w-3xl">
        {/* Score hero */}
        <div className={`rounded-2xl border-2 ${grade.border} ${grade.bg} p-8 text-center mb-8`}>
          <div className="text-6xl mb-4">
            {results.percentage >= 90 ? '🏆' : results.percentage >= 70 ? '👍' : results.percentage >= 50 ? '📖' : '🎯'}
          </div>
          <div className="text-5xl font-extrabold text-gray-900 mb-3">
            {results.correct}/{results.total}
          </div>
          <div className={`text-xl font-semibold ${grade.color} mb-4`}>{grade.label}</div>
          <p className="text-gray-700 leading-relaxed max-w-xl mx-auto">{grade.summary}</p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/60 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{results.correctPhishing}</div>
              <div className="text-xs text-gray-600">Phishing Caught</div>
            </div>
            <div className="rounded-xl bg-white/60 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{results.correctLegitimate}</div>
              <div className="text-xs text-gray-600">Legitimate Correct</div>
            </div>
            <div className="rounded-xl bg-white/60 p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{results.missedPhishing}</div>
              <div className="text-xs text-gray-600">Phishing Missed</div>
            </div>
            <div className="rounded-xl bg-white/60 p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{results.falsePositive}</div>
              <div className="text-xs text-gray-600">False Alarms</div>
            </div>
          </div>
        </div>

        {/* Where you struggled */}
        {(missedPhishingCategories.length > 0 || missedLegitCategories.length > 0) && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 mb-8">
            <h3 className="text-lg font-bold text-amber-900 mb-4">⚠ Areas to Work On</h3>
            {missedPhishingCategories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">Phishing types you missed:</p>
                <div className="flex flex-wrap gap-2">
                  {missedPhishingCategories.map((cat) => (
                    <span key={cat} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">{cat}</span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-amber-700">
                  These are the most common phishing patterns targeting small businesses. Review the explanations for these emails — the specific tells will help you spot them next time.
                </p>
              </div>
            )}
            {missedLegitCategories.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-2">Legitimate emails you flagged as phishing:</p>
                <div className="flex flex-wrap gap-2">
                  {missedLegitCategories.map((cat) => (
                    <span key={cat} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">{cat}</span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-amber-700">
                  Being cautious is good — but flagging real emails as phishing can slow down your work. The green flags in the explanations will help you build confidence in spotting the real ones.
                </p>
              </div>
            )}
          </div>
        )}

        {/* What you nailed */}
        {results.correct >= 8 && (
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6 mb-8">
            <h3 className="text-lg font-bold text-green-900 mb-2">💪 Your Strengths</h3>
            <p className="text-sm text-green-800">
              You correctly identified {results.correct} out of {results.total} emails.
              {results.missedPhishing === 0 && ' You caught every single phishing attempt — your team is lucky to have you as a defense against email threats.'}
              {results.falsePositive === 0 && ' You did not flag any legitimate emails as phishing — a sign that you know the difference between real communications and scams.'}
            </p>
          </div>
        )}

        {/* Key lesson summary */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 The 4 Rules to Remember</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold text-sm">1</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Check the actual sender address</p>
                <p className="text-xs text-gray-600 mt-0.5">Not just the display name — click to expand the full email address. If the domain after @ is not the company's actual domain, it is fake.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold text-sm">2</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Hover before you click</p>
                <p className="text-xs text-gray-600 mt-0.5">Hover your mouse over every link to preview the real URL. If it does not match the company's actual domain, do not click.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold text-sm">3</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Urgency is the #1 red flag</p>
                <p className="text-xs text-gray-600 mt-0.5">"24 hours," "your account will be closed," "act now" — real companies do not threaten you via email. Pause and verify.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-sm">4</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Verify through a different channel</p>
                <p className="text-xs text-gray-600 mt-0.5">Got a weird email from your boss? Call or Slack them. "Urgent" invoice from a vendor? Call their published number. Never verify through the email itself.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              setAnswers({});
              setCurrentQuestion(0);
              setLastAnswer(null);
              setStage('intro');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-700 transition-all duration-200 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
            Retake Quiz
          </button>
          <a
            href="/blog/phishing-prevention/"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:border-primary-400 hover:text-primary-700 transition-all duration-200 no-underline"
          >
            📖 Read: Phishing Prevention Guide
          </a>
        </div>
      </div>
    );
  }

  return null;
}
