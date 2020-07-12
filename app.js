require('dotenv').config()
const pupHelper = require('./puppeteerhelper');
const fs = require('fs');
const siteLink = 'https://www.tiktok.com/@';
let browser;

const run = async () => {
  try {
    browser = await pupHelper.launchBrowser();

    let usernames = fs.readFileSync('usernames.txt', 'utf-8');
    usernames = usernames.split('\n');
    usernames = usernames.map(un => un.replace('\r', '').trim());
    
    for (let userNumber = 0; userNumber < usernames.length; userNumber++) {
      console.log(`${userNumber+1}/${usernames.length} - Checking user name [${usernames[userNumber]}]`);
      const result = await fetch(usernames[userNumber]);
      console.log(`User found: ${result}`);

      if (!result) {
        if (fs.existsSync('usernames-results.txt')) {
          fs.appendFileSync('usernames-results.txt', `${usernames[userNumber]}\n`);
        } else {
          fs.writeFileSync('usernames-results.txt', `${usernames[userNumber]}\n`);
        }
      }
    }
    
    await browser.close();
  } catch (error) {
    if (browser) await browser.close();
    return error;
  }
};

const fetch = (username) => new Promise(async (resolve, reject) => {
  let page;
  try {
    let result = true;
    page = await pupHelper.launchPage(browser);
    const response = await page.goto(`${siteLink}${username}`, {timeout: 0, waitUntil: 'load'});
    
    await page.waitForSelector('#main');
    const errorMessage = await page.$('#main .error-page');


    if (errorMessage) result = false;

    await page.close();
    resolve(result);
  } catch (error) {
    if (page) await page.close();
    console.log(`Run Error: ${error}`);
    reject(error);
  }
})

run();
