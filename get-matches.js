const html = require('fs').readFileSync('html-out.txt', 'utf8');
const regex = /\["(https:\/\/lh3\.googleusercontent\.com\/(?:pw\/)?[a-zA-Z0-9\-_]+)"/g;
let matches = [...html.matchAll(regex)];
console.log("Matches:", matches.length);
if (matches.length === 0) {
    const rawMatch = html.match(/(https:\/\/lh3\.googleusercontent\.com\/(?:pw\/)?[a-zA-Z0-9\-_]+)/g);
    console.log("Raw matches:", rawMatch?.length);
    if (rawMatch) console.log(rawMatch[0]);
}
