import fs from 'fs';
const text = fs.readFileSync('funhtml5.html', 'utf8');
const cats = text.match(/category/i);
console.log("Cats found:", cats);
const allText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
console.log(allText.slice(0, 500));
