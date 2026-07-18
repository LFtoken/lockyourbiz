import { useState, useEffect, useRef, useCallback } from 'react';

interface SlideData {
  badge: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  gradient: string;
  stats: { value: string; label: string }[];
  adLabel: string;
  adTitle: string;
  adDesc: string;
  adHref: string;
}

const slides: SlideData[] = [
  {
    badge: '🏪 Retail & Brick-and-Mortar',
    headline: 'Your shop\'s data is one ransomware attack away from gone',
    description:
      '63% of small retailers hit by ransomware lose access to inventory, POS records, and customer data for days — or forever. Most have no backup plan.',
    ctaText: 'Ransomware Protection Guide →',
    ctaHref: '/blog/ransomware-protection/',
    gradient: 'from-red-950 via-primary-950 to-primary-900',
    stats: [
      { value: '63%', label: 'of SMBs were attacked last year' },
      { value: '$25K', label: 'average breach cost for a small business' },
      { value: '60%', label: 'close within 6 months of an attack' },
    ],
    adLabel: 'Free Tool',
    adTitle: 'Security Assessment',
    adDesc: 'Find your weak spots in 3 minutes. Answer 20 questions, get a personalized risk score — free, no sign-up.',
    adHref: '/tools/security-assessment/',
  },
  {
    badge: '🌐 Cross-Border eCommerce',
    headline: 'Selling on Shopify or WordPress? Your store is scanned 2,000+ times a day',
    description:
      'Automated bots probe eCommerce sites for plugin vulnerabilities, payment skimmers, and weak admin panels. PCI-DSS and GDPR compliance is not optional — even for small sellers.',
    ctaText: 'Website Security Guide →',
    ctaHref: '/blog/website-security-guide/',
    gradient: 'from-primary-950 via-primary-900 to-cyan-950',
    stats: [
      { value: '2,000+', label: 'automated scans hit your site daily' },
      { value: '50,000+', label: 'vulnerable WordPress plugins in the wild' },
      { value: '$4.45M', label: 'global avg. cost of a data breach' },
    ],
    adLabel: 'Free Tool',
    adTitle: 'Password Strength Checker',
    adDesc: 'Is your admin password strong enough? Test it instantly — we never store or transmit anything you type.',
    adHref: '/tools/password-checker/',
  },
  {
    badge: '👥 Remote Teams & Small Business',
    headline: 'One wrong click by a remote employee can cost you $25,000',
    description:
      '90% of breaches begin with phishing. Remote workers are 3× more vulnerable without in-office quick-checks. Five minutes of training cuts risk by 70%.',
    ctaText: 'Test Your Team\'s Awareness →',
    ctaHref: '/tools/phishing-quiz/',
    gradient: 'from-primary-950 via-indigo-950 to-purple-950',
    stats: [
      { value: '90%', label: 'of breaches start with a phishing email' },
      { value: '3×', label: 'more likely to fall for scams when remote' },
      { value: '70%', label: 'risk reduction with basic awareness training' },
    ],
    adLabel: 'Free Guide',
    adTitle: '30-Minute Employee Training',
    adDesc: 'Ready-to-use training script + follow-up plan. Practical examples your team will actually remember.',
    adHref: '/blog/employee-security-training/',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
    },
    [],
  );

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, next]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured security guides for your business"
    >
      {/* Slides */}
      <div className="relative" aria-live="polite">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${slide.gradient} transition-opacity duration-700 ${
              i === current
                ? 'opacity-100 relative'
                : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${slides.length}: ${slide.badge}`}
            aria-hidden={i !== current}
          >
            {/* Decorative dots */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 mb-5">
                  <span className="text-sm font-medium text-white/90">
                    {slide.badge}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.headline}
                </h1>

                {/* Description */}
                <p className="mt-5 text-lg leading-7 text-white/80 max-w-2xl">
                  {slide.description}
                </p>

                {/* CTA */}
                <div className="mt-7">
                  <a
                    href={slide.ctaHref}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-white px-7 py-3.5 text-base font-bold text-white shadow-lg hover:bg-white hover:text-primary-700 transition-all duration-200 no-underline min-h-[44px] cursor-pointer"
                  >
                    {slide.ctaText}
                  </a>
                </div>
              </div>

              {/* Stats + Ad Card row */}
              <div className="mt-12 flex flex-col gap-5 lg:flex-row">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 lg:flex-1">
                  {slide.stats.map((stat, si) => (
                    <div
                      key={si}
                      className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10 text-center"
                    >
                      <div className="text-xl font-bold text-white sm:text-2xl">
                        {stat.value}
                      </div>
                      <p className="mt-1 text-xs text-white/70 leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Native Ad Card */}
                <div className="lg:w-72 lg:shrink-0">
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 h-full flex flex-col">
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                      {slide.adLabel}
                    </span>
                    <a
                      href={slide.adHref}
                      className="text-base font-semibold text-white hover:underline no-underline cursor-pointer"
                    >
                      {slide.adTitle}
                    </a>
                    <p className="mt-1.5 text-sm text-white/70 leading-relaxed flex-1">
                      {slide.adDesc}
                    </p>
                    <a
                      href={slide.adHref}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors no-underline cursor-pointer"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div
        className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5"
        role="tablist"
        aria-label="Slide navigation"
      >
        {slides.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 cursor-pointer min-h-[12px] min-w-[12px] ${
              i === current
                ? 'bg-white w-8 h-3'
                : 'bg-white/40 hover:bg-white/70 w-3 h-3'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
