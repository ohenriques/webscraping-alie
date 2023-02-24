const puppeteer = require('puppeteer');
const fs = require('fs');

// const url = 'https://pt.aliexpress.com/item/33044155956.html?gatewayAdapt=glo2bra';
const url = 'https://pt.aliexpress.com/?gatewayAdapt=glo2bra';

const searchFor = 'memoria ram ddr4 asgard';
const list = [];

let c = 1;
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log('starting');

  await page.goto(url);
  await page.waitForSelector("#search-key")
  // console.log('goto: ' + url); 

  await page.type("#search-key", searchFor);


  await Promise.all([
    page.waitForNavigation(),
    page.click(".search-button")
  ])

  const links = await page.$$eval('.list--gallery--34TropR > a ', el => el.map(link => link.href));

  for (const link of links) {
    // console.log(' Go to ' + link);
    await page.goto(link);
    await page.waitForSelector('.product-title-text');

    const title = await page.$eval(".product-title-text", element => element.innerText);
    // const price = await page.$eval(".uniform-banner-box-price", element => element.innerText);

    const normalPrice = await page.evaluate(() => {
      const el = document.querySelector('.product-price-value');
      if (!el) return null;
      return el.innerText;
    })

    const bestPrice = await page.evaluate(() => {
      const el = document.querySelector('.uniform-banner-box-price');
      if (!el) return null;
      return el.innerText;
    })


    const obj = {};
    obj.title = title;
    obj.link = link;
    // obj.price = price;
    (normalPrice ? obj.normalPrice = normalPrice : "");
    (bestPrice ? obj.bestPrice = bestPrice : "");

    list.push(obj);

    await page.goto(link);




    c++;
  }

  console.log(list);
  const stringObjetos = JSON.stringify(list, null, 2);

  fs.writeFile('produtos.txt', stringObjetos, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Arquivo salvo com sucesso!');
    }
  });

  await page.waitForTimeout(3000);
  await browser.close()


})();