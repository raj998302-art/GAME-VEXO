import fs from 'fs';

const html = fs.readFileSync('funhtml5.html', 'utf-8');

// The HTML structure has:
// <div class="game_thumb_holder"... >
// <a href="?play=GAMENAME">
//   ...
//   <img src="//funhtml5games.com/images/GAMENAME.EXT" ...>
//   ...
// </a>
// TITLE<div class="throbber">NEW!</div>
// </div>

const games = [];

// Split by game_thumb_holder to isolate elements
const parts = html.split('game_thumb_holder"');
for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  
  const playMatch = part.match(/href="\?play=([^"]+)"/);
  const imgMatch = part.match(/src="\/\/[^\/]*funhtml5games\.com\/images\/([^"]+)"/);
  
  if (playMatch && imgMatch) {
    const playId = playMatch[1];
    const imagePath = imgMatch[1];
    
    // Title is after </a> and before <div class="throbber"> or </div>
    const titleMatch = part.match(/<\/a>([^<]+)/);
    const title = titleMatch ? titleMatch[1].trim().replace(/NEW!/g, '').trim() : playId;
    
    games.push({
      title: title || playId,
      description: `Play ${title || playId} online for free!`,
      category: 'Arcade',
      thumbnail: `https://funhtml5games.com/images/${imagePath}`,
      gameUrl: `https://funhtml5games.com?embed=${playId}`,
      uploadType: 'url',
      privacyPolicyUrl: 'https://funhtml5games.com',
      slug: playId
    });
  }
}

fs.writeFileSync('public/games_import.json', JSON.stringify(games, null, 2));
console.log(`Generated ${games.length} games`);
