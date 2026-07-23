const fs = require('fs');
async function test() {
  const res = await fetch("https://photos.app.goo.gl/ibfGhkTzuHmWxsea9", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept-Language': 'en-US,en;q=0.9',
      }
  });
  const html = await res.text();
  fs.writeFileSync('html-out.txt', html);
}
test();