import fs from 'fs';
const data = JSON.parse(fs.readFileSync('./public/games_import.json', 'utf8'));
console.log(data.length, typeof data[0].title);
