import fs from 'fs';

async function fetchHome() {
  const res = await fetch('https://funhtml5games.com/');
  const text = await res.text();
  console.log("Size:", text.length);
  const parts = text.split('game_thumb_holder"');
  console.log("Games found:", parts.length - 1);
  
  const matches = [...text.matchAll(/page=(\d+)|category=([^"&]+)|ajax/g)];
  console.log("Matches:", new Set(matches.map(m => m[0])));
}

fetchHome();
