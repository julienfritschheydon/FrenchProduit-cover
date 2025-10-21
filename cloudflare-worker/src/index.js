export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { html, width = 1200, height = 675 } = await request.json();

      if (!html) {
        return new Response(
          JSON.stringify({ error: 'HTML content is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log('Starting browser...');
      
      // Utiliser Browser Rendering de Cloudflare
      const browser = await env.BROWSER.launch();
      const page = await browser.newPage();

      await page.setViewport({ width, height });
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      console.log('Taking screenshot...');
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false,
      });

      await browser.close();

      console.log('Screenshot generated successfully');

      // Retourner l'image
      return new Response(screenshot, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/png',
          'Content-Length': screenshot.length,
        },
      });

    } catch (error) {
      console.error('Error generating image:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to generate image',
          message: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
