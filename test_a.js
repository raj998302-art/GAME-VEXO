import fs from 'fs';
async function testA() {
  const res = await fetch('https://funhtml5games.com/');
  const text = await res.text();
  const tags = text.match(/<a [^>]+>/ig);
  console.log("All a tags:", tags.slice(0, 50)); // let's see some
}
testA();
