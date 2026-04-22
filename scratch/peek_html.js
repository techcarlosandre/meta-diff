const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

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

async function peekHTML() {
    try {
        const html = await fetchPage('https://www.leagueofgraphs.com/rankings/summoners/br');
        console.log(html);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

peekHTML();
