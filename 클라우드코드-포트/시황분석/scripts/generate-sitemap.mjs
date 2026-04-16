import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://stockanalysis2.pages.dev';
const PUBLIC_DIR = path.join(__dirname, '../public');
const CONTENT_DIR = path.join(__dirname, '../content');

const now = new Date().toISOString().split('T')[0];

const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/market', priority: '0.8', changefreq: 'daily' },
    { url: '/analysis', priority: '0.8', changefreq: 'daily' },
    { url: '/education', priority: '0.8', changefreq: 'daily' },
    { url: '/calendar', priority: '0.8', changefreq: 'daily' },
    { url: '/picks', priority: '0.8', changefreq: 'daily' },
];

const contentMappings = [
    { dir: 'market-analysis', route: 'market', priority: '0.6', changefreq: 'weekly' },
    { dir: 'stock-reports', route: 'analysis', priority: '0.6', changefreq: 'weekly' },
    { dir: 'education', route: 'education', priority: '0.5', changefreq: 'monthly' },
    { dir: 'picks', route: 'picks', priority: '0.7', changefreq: 'daily' },
];

function generateSitemap() {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Static Pages
    staticPages.forEach(page => {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
    });

    // 2. Dynamic Content from MDX
    contentMappings.forEach(mapping => {
        const fullPath = path.join(CONTENT_DIR, mapping.dir);
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mdx'));
            files.forEach(file => {
                const slug = file.replace('.mdx', '');
                // 실제 파일 수정 시간을 가져오려고 시도 (없으면 오늘 날짜)
                const stats = fs.statSync(path.join(fullPath, file));
                const modDate = stats.mtime.toISOString().split('T')[0];

                xml += `  <url>\n`;
                xml += `    <loc>${BASE_URL}/${mapping.route}/${slug}</loc>\n`;
                xml += `    <lastmod>${modDate}</lastmod>\n`;
                xml += `    <changefreq>${mapping.changefreq}</changefreq>\n`;
                xml += `    <priority>${mapping.priority}</priority>\n`;
                xml += `  </url>\n`;
            });
        }
    });

    xml += `</urlset>`;

    const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`✅ Sitemap successfully generated at: ${outputPath}`);
}

generateSitemap();
