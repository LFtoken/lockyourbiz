// Cloudflare Pages Function — proxies CISA KEV API to avoid CORS issues
export async function onRequest(context) {
  const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

  try {
    const response = await fetch(CISA_KEV_URL, {
      headers: {
        'User-Agent': 'LockYourBiz/1.0 (Small Business Security Resource)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream API returned ${response.status}` }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache 5 minutes at CDN level
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch threat data', detail: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
