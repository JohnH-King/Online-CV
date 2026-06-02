const fs = require('fs');
const http = require('http');
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 8080;
const siteRoot = path.resolve(__dirname);
const canonicalSiteUrl = 'https://johnh-king.github.io/Online-CV/';

const legacyPages = new Set([
  '/hindex.html',
  '/page4.html',
  '/page6.html',
  '/render-html/index.html'
]);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.scss': 'text/x-scss; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendFile(res, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const stream = fs.createReadStream(filePath);

  res.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff'
  });

  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Unable to read file.');
  });
}

function resolveRequestPath(req) {
  let pathname = '/index.html';

  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch (error) {
    pathname = '/index.html';
  }

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  const relativePath = pathname.replace(/^\/+/, '');
  const filePath = path.resolve(siteRoot, relativePath);

  return { filePath, pathname };
}

function isInsideSiteRoot(filePath) {
  const relativePath = path.relative(siteRoot, filePath);

  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

const server = http.createServer((req, res) => {
  const { filePath, pathname } = resolveRequestPath(req);

  if (!isInsideSiteRoot(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (legacyPages.has(pathname) || pathname.startsWith('/api/steam')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Link', `<${canonicalSiteUrl}>; rel="canonical"`);
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    if (!path.extname(pathname)) {
      sendFile(res, path.join(siteRoot, 'index.html'));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
});

server.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`John King 2026 CV site available at http://${displayHost}:${port}`);
});
