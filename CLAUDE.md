# LockYourBiz — Project Overview

## Site
- URL: https://lockyourbiz.com
- Domain: lockyourbiz.com (bought on Cloudflare)
- GitHub: https://github.com/LFtoken/lockyourbiz
- Local: E:/谷歌建站/smallbizsecurity
- GA4: G-6H1KM8RNXP

## Tech Stack
- Astro 5 + React + Tailwind CSS 3
- Deployed on Cloudflare Pages (auto-deploy from GitHub master branch)
- 20 pages, 11 articles, 3 interactive tools
- Sitemap auto-generated via @astrojs/sitemap

## Site Structure
```
Home (/)
├── Tools
│   ├── /tools/security-assessment/  (React)
│   ├── /tools/password-checker/     (React)
│   └── /tools/tool-comparison/       (React)
├── Blog (11 articles)
│   ├── /blog/cybersecurity-101/
│   ├── /blog/phishing-prevention/
│   ├── /blog/free-security-tools/
│   ├── /blog/remote-work-security/
│   ├── /blog/ransomware-protection/
│   ├── /blog/security-audit-checklist/
│   ├── /blog/ai-security-tools/
│   ├── /blog/vpn-vs-zerotrust/
│   ├── /blog/cyber-insurance-guide/
│   ├── /blog/essential-security-hardware/
│   └── /blog/essential-security-services/
├── /about/
├── /privacy/
└── /contact/
```

## Key Components
- BaseLayout.astro — main template with GA, schema, nav, footer
- SecurityAssessment.tsx — 20 questions across 8 categories
- PasswordChecker.tsx — real-time password strength checker
- ToolComparison.tsx — 9 security tools comparison table

## Content Strategy
- Niche: Cybersecurity for non-technical small business owners
- Language: English, targeting US/UK audiences
- Content: Practical, no-jargon guides + free interactive tools
- Goal: 30 articles before AdSense application

## Common Tasks
- Add article: create .astro file in src/pages/blog/, add to blog/index.astro array
- Update homepage: edit featuredArticles in src/pages/index.astro
- Modify tools: edit .tsx in src/components/
- Build: npm run build (in E:/谷歌建站/smallbizsecurity)
- Push: git add -A && git commit && git push

## Git Config
- User: LFtoken
- Email: thereareapples@163.com
- SSH over port 443 (configured in ~/.ssh/config)
