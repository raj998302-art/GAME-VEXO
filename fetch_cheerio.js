import * as cheerio from 'cheerio';

async function crawl() {
  const res = await fetch('https://funhtml5games.com/');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const links = [];
  $('a').each((i, el) => {
    links.push($(el).attr('href'));
  });
  
  const uniqueLinks = [...new Set(links)];
  console.log("All Links:", uniqueLinks);
}
crawl();
