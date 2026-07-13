import { useState, useMemo } from 'react';

const ZXCVBN_PATTERNS = [
  { regex: /.{16,}/, label: '16+ characters', score: 3 },
  { regex: /.{12,15}/, label: '12–15 characters', score: 2 },
  { regex: /.{8,11}/, label: '8–11 characters', score: 1 },
  { regex: /.{1,7}/, label: 'Under 8 characters', score: 0 },
];

function analyzePassword(password: string) {
  if (!password) return { score: 0, checks: [], feedback: 'Enter a password to check its strength.' };

  const checks = [
    { label: 'At least 12 characters', pass: password.length >= 12, tip: 'Longer is stronger — aim for 12+ characters' },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(password), tip: 'Mix in uppercase letters (A-Z)' },
    { label: 'Contains lowercase letter', pass: /[a-z]/.test(password), tip: 'Use lowercase letters (a-z)' },
    { label: 'Contains numbers', pass: /\d/.test(password), tip: 'Add numbers (0-9)' },
    { label: 'Contains special character', pass: /[^A-Za-z0-9]/.test(password), tip: 'Add symbols like !@#$%^&*' },
    { label: 'Not a common password', pass: !isCommonPassword(password), tip: 'Avoid common passwords like "password123"' },
    { label: 'No repeated characters (3+)', pass: !/(.)\1{2,}/.test(password), tip: 'Avoid repeating the same character' },
    { label: 'No sequential patterns', pass: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890)/i.test(password), tip: 'Avoid keyboard walks and sequential patterns' },
  ];

  const passCount = checks.filter((c) => c.pass).length;
  const score = Math.min(100, Math.round((passCount / checks.length) * 100));

  if (score >= 90) return { score, checks, feedback: 'Excellent! This password meets enterprise-grade standards.', color: 'text-green-600', barColor: 'bg-green-500', bg: 'bg-green-50' };
  if (score >= 70) return { score, checks, feedback: 'Good password. Consider making it longer for extra security.', color: 'text-yellow-600', barColor: 'bg-yellow-500', bg: 'bg-yellow-50' };
  if (score >= 50) return { score, checks, feedback: 'This password could be cracked in days. Add more variety.', color: 'text-orange-600', barColor: 'bg-orange-500', bg: 'bg-orange-50' };
  return { score, checks, feedback: 'Very weak — this password can be cracked instantly. Make it longer and more complex.', color: 'text-red-600', barColor: 'bg-red-500', bg: 'bg-red-50' };
}

const COMMON_PASSWORDS = new Set([
  'password', 'password123', '12345678', '123456789', 'qwerty123',
  'admin', 'admin123', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'abc123', 'trustno1', 'football', 'iloveyou', 'sunshine',
  'shadow', 'princess', 'password1', 'qwerty', '111111', '123123',
]);

function isCommonPassword(pw: string): boolean {
  return COMMON_PASSWORDS.has(pw.toLowerCase());
}

function estimateCrackTime(password: string): string {
  if (password.length < 6) return 'Instantly';
  if (password.length < 8) return 'Seconds';
  if (password.length < 10) {
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Hours to days';
    return 'Minutes';
  }
  if (password.length < 12) {
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Months';
    return 'Days to weeks';
  }
  if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) return 'Centuries';
  return 'Years';
}

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const result = useMemo(() => analyzePassword(password), [password]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Type a password to test..."
          className="w-full rounded-xl border border-gray-300 px-4 py-4 pr-12 text-lg shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all font-mono"
          autoComplete="off"
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {password && (
        <div className="mt-6 space-y-5">
          {/* Score bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Strength</span>
              <span className={`text-sm font-bold ${result.color}`}>{result.score}/100</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${result.barColor}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {/* Feedback */}
          <div className={`rounded-lg ${result.bg} p-4`}>
            <p className={`text-sm font-semibold ${result.color}`}>{result.feedback}</p>
            <p className="text-xs text-gray-600 mt-1">
              Estimated time to crack: <span className="font-mono font-semibold">{estimateCrackTime(password)}</span>
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Checklist:</h4>
            {result.checks.map((check) => (
              <div key={check.label} className="flex items-center gap-2 text-sm">
                <span className={check.pass ? 'text-green-500' : 'text-red-400'}>
                  {check.pass ? '✓' : '✗'}
                </span>
                <span className={check.pass ? 'text-gray-700' : 'text-gray-500'}>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
