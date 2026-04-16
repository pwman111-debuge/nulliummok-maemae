
async function testTossPrices() {
    const TOSS_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.tossinvest.com',
    };
    
    const id = 'RFU.CLv1';
    const url = `https://wts-info-api.tossinvest.com/api/v1/index-prices/${id}`;
    
    console.log("Testing Toss Price API:", url);
    const res = await fetch(url, { headers: TOSS_HEADERS });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
}

async function testTossCalendar() {
    const HEADERS = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.tossinvest.com/calendar',
        'Origin': 'https://www.tossinvest.com'
    };
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const url = `https://wts-cert-api.tossinvest.com/api/v4/calendar/monthly/${currentYM}`;
    
    console.log("\nTesting Toss Calendar API:", url);
    const res = await fetch(url, { method: 'POST', headers: HEADERS, body: "{}" });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
}

async function main() {
    await testTossPrices();
    await testTossCalendar();
}

main().catch(console.error);
