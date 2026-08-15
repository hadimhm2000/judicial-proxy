const express = require('express');
const app = express();

// دریافت بدنه خام برای هر نوع محتوا (json, multipart, ...)
app.use(express.raw({ type: '*/*', limit: '50mb' }));

app.all('*', async (req, res) => {
  const targetUrl = 'https://api.telegram.org' + req.originalUrl;
  const headers = { ...req.headers };
  delete headers.host; // هدر host مربوط به Render است و باید حذف شود

  const fetchOptions = { method: req.method, headers };
  if (!['GET', 'HEAD'].includes(req.method)) {
    fetchOptions.body = req.body;
  }

  try {
    const upstream = await fetch(targetUrl, fetchOptions);
    const buf = Buffer.from(await upstream.arrayBuffer());
    upstream.headers.forEach((v, k) => {
      if (!['content-encoding','transfer-encoding','connection','content-length'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.status(upstream.status).send(buf);
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('judicial-proxy running on ' + port));