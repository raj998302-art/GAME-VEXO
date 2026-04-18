import fs from 'fs';

async function crawl() {
  const res = await fetch('https://funhtml5games.com/');
  const html = await res.text();
  
  const links = Array.from(html.matchAll(/href=["'](.*?)["']/ig)).map(m => m[1]);
  const uniqueLinks = [...new Set(links)];
  
  console.log("Found links:", uniqueLinks.filter(l => !l.includes('play=')));
}

crawl();
