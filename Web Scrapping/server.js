const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

let alumniData = [];

app.use(express.static('public'));

// Endpoint to fetch alumni data as JSON
app.get('/api/alumni', (req, res) => {
  res.json(alumniData);
});

// Function to convert JSON data into CSV format
function convertToCSV(data) {
  const csvHeaders = ['Name', 'Graduation Year', 'Degree'];
  const csvRows = data.map(item => `"${item.name}","${item.year}","${item.degree}"`);
  return [csvHeaders.join(','), ...csvRows].join('\n');
}

(async () => {
  console.log('Starting alumni data scraping...');
  alumniData = await scrapeAlumniData();
  console.log('Scraping completed.');

  // Save scraped data to CSV
  const csvContent = convertToCSV(alumniData);
  fs.writeFileSync('public/alumni_data.csv', csvContent);
  console.log('Data successfully saved to alumni_data.csv');

  // Start the server after scraping is complete
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

// Function to scrape alumni data
async function scrapeAlumniData() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  
  console.log('Navigating to the alumni portal...');
  await page.goto('https://alumni.uohyd.ac.in/members');

  await page.waitForSelector('#email');
  await page.type('#email', 'kuntaamartya@gmail.com', { delay: 100 });
  await page.click('#emailBtn');
  await new Promise(resolve => setTimeout(resolve, 3000));

  await page.waitForSelector('#passwordLogin');
  await page.type('#passwordLogin', 'amartya#16');
  const loginBtnSelector = '#inside-ui-view > ui-view > main > div.mdl-grid.login-size.contact-div-change.main-family > div > div > div.mdl-cell.mdl-cell--12-col-tablet.login-top-div.login-signup-padding.flexbox.mdl-cell--7-col.login-border > div > form > div:nth-child(4) > button';
  await page.click(loginBtnSelector);
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Login successful.');

  const alumni = [];
  const batchSelector = '[ng-click*="select_in_level"]';

  // Iterate through batches
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector(batchSelector);
    const batches = await page.$$(batchSelector);
    if (i >= batches.length) break;

    const batchTitle = await batches[i].$eval('span', el => el.textContent.trim());
    console.log(`Clicking batch: ${batchTitle}`);
    await batches[i].click();
    await page.waitForSelector('[ng-click*="count_obj2.key"]');

    const deptSelector = '[ng-click*="count_obj2.key"]';
    const deptCount = (await page.$$(deptSelector)).length;

    // Iterate through departments
    for (let j = 0; j < deptCount; j++) {
      await page.waitForSelector(deptSelector);
      const deptCards = await page.$$(deptSelector);
      const deptName = await deptCards[j].$eval('span', el => el.textContent.trim());
      console.log(`Clicking department: ${deptName}`);
      await deptCards[j].click();

      await page.waitForSelector('.maximize-width.border-box.padding-12');
      const memberCards = await page.$$('.maximize-width.border-box.padding-12');

      // Save alumni member information
      for (const card of memberCards) {
        const name = await card.$eval('a.link-detail', el => el.textContent.trim());
        alumni.push({
          name,
          year: batchTitle,
          degree: deptName
        });
        console.log(`Saved: ${name}, ${batchTitle}, ${deptName}`);
      }

      // Navigate back to department level
      await page.goBack({ waitUntil: 'networkidle0' });
    }

    // Navigate back to batch level
    await page.goBack({ waitUntil: 'networkidle0' });
  }

  await browser.close();
  return alumni;
}
