import fs from 'fs';

async function checkMore() {
  const res = await fetch('https://funhtml5games.com/');
  const text = await res.text();
  
  // Find everything that involves "button", "load", "more", "next", "page"
  const m = text.match(/<[^>]+(?:next|more|page|load)[^>]*>/ig);
  console.log(m);
}
checkMore();
