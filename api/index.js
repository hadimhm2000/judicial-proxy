export default async function handler(req, res) {
  const targetUrl = 'https://api.telegram.org' + req.url;
  const headers = { ...req.headers };
  delete headers.host;

  const fetchOptions = { method: req.method, headers };
  if (!['GET', 'HEAD'].includes(req.method)) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(targetUrl, fetchOptions);
    const data = await upstream.text();
    res.status(upstream.status).send(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
}