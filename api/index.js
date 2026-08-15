export default async function handler(req, res) {
  const targetUrl = 'https://api.telegram.org' + req.url;

  const headers = {};
  for (const key in req.headers) {
    if (!['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers[key] = req.headers[key];
    }
  }

  const options = { method: req.method, headers };

  if (!['GET', 'HEAD'].includes(req.method)) {
    const body = await new Promise((resolve) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
    });
    if (body.length > 0) {
      options.body = body;
    }
  }

  try {
    const response = await fetch(targetUrl, options);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    const respHeaders = {};
    response.headers.forEach((v, k) => {
      if (!['content-encoding', 'transfer-encoding', 'content-length', 'connection'].includes(k.toLowerCase())) {
        respHeaders[k] = v;
      }
    });

    res.writeHead(response.status, respHeaders);
    res.end(buffer);
  } catch (err) {
    res.status(502).json({ ok: false, error_code: 502, description: 'Proxy Error: ' + err.message });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};