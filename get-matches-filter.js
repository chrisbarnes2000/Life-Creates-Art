const html = require('fs').readFileSync('html-out.txt', 'utf8');
const regex = /\["(https:\/\/lh3\.googleusercontent\.com\/(?:pw\/)?[a-zA-Z0-9\-_]+)"/g;
let matches = [...html.matchAll(regex)];
let unique = [...new Set(matches.map(m => m[1]))];
let filtered = unique.filter(url => url.split('/').pop().length > 40);
console.log("Filtered Matches:", filtered.length);
