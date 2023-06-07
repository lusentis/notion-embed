/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const SITE_URL = "https://bugpilot.notion.site";
const CUSTOM_URL = "https://notion-contents.bugpilot.io";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      // make subrequests with the global `fetch()` function
      let res = await fetch(`${SITE_URL}${url.pathname}`, request);

      if (url.pathname.startsWith('/api/v3/getPublicPageData')) {
        return new Response(null, {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      if (!res.headers.get('Content-Type').includes('text/html')) {
        return res;
      }

      let html = await res.text();
      html = html.replace('</body>', `
<script>window.CONFIG.domainBaseUrl = "${CUSTOM_URL}";</script>
<style>
.notion-topbar { 
  display: none !important;
}
</style>
</body>`);

      res = new Response(html, {
        headers: res.headers
      });

      res.headers.delete('X-Frame-Options');
      res.headers.delete('Set-Cookie');
      res.headers.delete('Expires');
      res.headers.delete('Surrogate-Control');
      res.headers.delete('Cache-Control');
      res.headers.delete('Report-to');
      res.headers.set('Cache-Control', 'public, max-age=60');
      return res;
    } catch (e) {
      console.error('Cannot fetch', e);
      return new Response('Server error');
    }
  },
};
