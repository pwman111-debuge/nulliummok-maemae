import { fetchNaverMarketData } from './src/lib/api/naver-scraper';

async function main() {
    console.log("Fetching naver and toss data...");
    try {
        const data = await fetchNaverMarketData();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
