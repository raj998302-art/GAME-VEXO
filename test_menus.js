import fs from 'fs';
const text = fs.readFileSync('funhtml5.html', 'utf8');
const menuMatches = text.match(/<nav[^>]*>.*?<\/nav>|<ul[^>]*>.*?<\/ul>/isg);
console.log(menuMatches ? menuMatches.map(m => m.slice(0, 500)) : "no menus");
