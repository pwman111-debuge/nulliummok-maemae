const http = require('http');

const pages = ['/', '/calendar', '/education'];

async function testPage(path) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', (c) => { data += c; });
            res.on('end', () => {
                const hasError = data.includes('Server Error') || data.includes('Internal Server Error');
                const status = hasError ? '❌ ERROR' : '✅ OK';
                console.log(`${status} [${res.statusCode}] ${path} (${data.length} bytes)`);
                if (hasError) {
                    const errMatch = data.match(/Error:.*?(?=<)/);
                    if (errMatch) console.log('  └─', errMatch[0]);
                }
                resolve();
            });
        });
        req.on('error', (e) => { console.log(`❌ FAIL ${path}: ${e.message}`); resolve(); });
        req.setTimeout(10000);
    });
}

(async () => {
    for (const p of pages) await testPage(p);
    console.log('\nDone!');
})();
