import https from 'https';

https.get('https://stockanalysis2.pages.dev/sitemap.xml', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Body Preview (first 100 chars):', data.substring(0, 100));
    console.log('Ends with </urlset>:', data.trim().endsWith('</urlset>'));
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
