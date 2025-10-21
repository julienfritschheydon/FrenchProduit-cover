const functions = require('@google-cloud/functions-framework');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

functions.http('generateCover', async (req, res) => {
  // Autoriser les requêtes depuis Apps Script
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { html, width = 1200, height = 675 } = req.body;
    if (!html) {
      res.status(400).json({ error: 'HTML content is required' });
      return;
    }

    console.log('Starting browser...');
    
    // Utiliser @sparticuz/chromium (optimisé pour serverless)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load'],
      timeout: 30000
    });

    await page.evaluateHandle('document.fonts.ready');

    console.log('Taking screenshot...');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      omitBackground: false
    });

    await browser.close();

    console.log('Screenshot generated successfully');
    console.log('Screenshot size:', screenshot.length, 'bytes');

    // Retourner l'image directement (méthode confirmée par la doc)
    res.setHeader('Content-Type', 'image/png');
    res.send(screenshot);

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});