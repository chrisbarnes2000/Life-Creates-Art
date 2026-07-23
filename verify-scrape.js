const fs = require('fs');

async function extractGooglePhotos(albumUrl) {
  try {
    const res = await fetch(albumUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    console.log('Status:', res.status);
    console.log('Redirected:', res.redirected);
    console.log('URL:', res.url);
    const html = await res.text();
    fs.writeFileSync('debug-html.txt', html);
    
    // Look for more general patterns if the specific one fails
    const regex1 = /\["(https:\/\/lh3\.googleusercontent\.com\/(?:pw\/)?[a-zA-Z0-9\-_]+)"/g;
    const matches1 = [...html.matchAll(regex1)];
    console.log('Regex 1 matches:', matches1.length);

    const regex2 = /"(https:\/\/lh3\.googleusercontent\.com\/(?:pw\/)?[a-zA-Z0-9\-_]+)"/g;
    const matches2 = [...html.matchAll(regex2)];
    console.log('Regex 2 (looser) matches:', matches2.length);

    // Filter and deduplicate
    const unique = [...new Set(matches2.map(m => m[1]))].filter(url => {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        return id.length > 40; 
    });
    console.log('Unique filtered matches:', unique.length);
    
    return unique.slice(0, 5);
  } catch (err) {
    console.error('Failed:', err);
    return [];
  }
}

const urls = [
  'https://photos.app.goo.gl/ibfGhkTzuHmWxsea9',
  'https://photos.app.goo.gl/bdqcBJWYdtPwa2sv6',
  'https://photos.app.goo.gl/g9JnA5McpqAFiwg8A'
];

async function run() {
  for (const url of urls) {
    console.log(`\nTesting ${url}:`);
    const result = await extractGooglePhotos(url);
    console.log('Result count:', result.length);
  }
}

run();
