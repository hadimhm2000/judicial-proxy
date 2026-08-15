module.exports = async (req, res) => {
  const targetUrl = 'https://api.telegram.org' + req.url;
  
  // کپی هدرها و حذف هاست ورسل
  const headers = { ...req.headers };
  delete headers.host;

  const fetchOptions = { method: req.method, headers };

  // خواندن بدنه به صورت باینری خام (برای جلوگیری از خراب شدن فایل‌ها)
  if (!['GET', 'HEAD'].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    fetchOptions.body = Buffer.concat(chunks);
  }

  try {
    const upstream = await fetch(targetUrl, fetchOptions);
    const buffer = Buffer.from(await upstream.arrayBuffer());
    
    // انتقال هدرهای پاسخ تلگرام
    upstream.headers.forEach((v, k) => {
      if (!['content-encoding','transfer-encoding','connection','content-length'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    
    res.status(upstream.status).send(buffer);
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
};