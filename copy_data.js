import fs from 'fs';
if (!fs.existsSync('src/data')) {
  fs.mkdirSync('src/data');
}
const data = fs.readFileSync('public/games_import.json', 'utf8');
fs.writeFileSync('src/data/gamesData.json', data);
