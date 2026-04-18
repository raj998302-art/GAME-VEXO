import fs from 'fs';
async function testSitemap() {
  const res = await fetch('https://funhtml5games.com/sitemap.xml');
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response length:", text.length);
  if (text.length > 0 && text.length < 1000) console.log(text);
}
testSitemap();
