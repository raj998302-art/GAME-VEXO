import fs from 'fs';
async function testRobots() {
  const res = await fetch('https://funhtml5games.com/robots.txt');
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Content:", text);
}
testRobots();
