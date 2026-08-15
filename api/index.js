export default async function handler(req, res) {
  const targetUrl = 'https://api.telegram.org' + req.url;

  // پاکسازی هدرها برای جلوگیری از تداخل با تلگرام
  const headers = {};
  for (const key in req.headers) {
    if (!['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
      headers[key] = req.headers[key];
    }
  }

  const options = { method: req.method, headers };

  // خواندن بدنه درخواست به صورت باینری خام (برای فایل‌ها)
  if (!['GET', 'HEAD'].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    if (body.length > 0) options.body = body;
  }

  try {
    const response = await fetch(targetUrl, options);
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // تنظیم هدرهای پاسخ
    const respHeaders = {};
    response.headers.forEach((v, k) => {
      if (!['content-encoding', 'transfer-encoding', 'content-length', 'connection'].includes(k.toLowerCase())) {
        respHeaders[k] = v;
      }
    });

    res.writeHead(response.status, respHeaders);
    res.end(buffer);
  } catch (err) {
    // برگرداندن خطا به صورت JSON تا ربات aiogram کرش نکند
    res.status(502).json({ ok: false, error_code: 502, description: 'Proxy Error: ' + err.message });
  }
}