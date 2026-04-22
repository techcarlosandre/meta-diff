const cheerio = require('cheerio');
const https = require('https');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function debugLeaders() {
    console.log('Fetching summoner rankings...');
    try {
        const html = await fetchPage('https://www.leagueofgraphs.com/rankings/summoners/br');
        const $ = cheerio.load(html);
        console.log('HTML length:', html.length);
        
        const table = $('table.data_table');
        console.log('Table found:', table.length);
        
        const rows = $('table.data_table tr:not(.header)');
        console.log('Rows found:', rows.length);

        rows.each((i, row) => {
            if (i >= 5) return;
            const fullText = $(row).find('td:nth-child(2) .name span').text().trim();
            const winRateCell = $(row).find('td:nth-child(3)').text().trim();
            console.log(`Row ${i}: text="${fullText}" winrate="${winRateCell}"`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

debugLeaders();
