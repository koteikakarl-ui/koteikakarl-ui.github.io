import {readFileSync,writeFileSync} from 'node:fs';
const sheets=["styles.css", "responsive.css", "language.css", "portal-layout-photo-13.css", "case-polish.css", "footer-reviews.css", "about-experience.css", "portfolio-polish.css", "china-results-quality.css", "gallery-captions.css", "section-polish.css", "hero-motion.css", "publication-links.css"];
writeFileSync(new URL('./portfolio.css',import.meta.url),sheets.map(n=>'/* '+n+' */\n'+readFileSync(new URL(n,import.meta.url),'utf8').replace(/^\uFEFF/,'')).join('\n'));
