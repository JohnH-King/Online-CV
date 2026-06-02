const fs = require('fs');
const http = require('http');
const path = require('path');

const host = process.env.HOST || '0.0.0.0';
const configuredPort = Number(process.env.PORT);
const port = Number.isInteger(configuredPort) && configuredPort >= 0 ? configuredPort : 8080;
const siteRoot = path.resolve(__dirname);
const homepage = '/index.html';
const canonicalSiteUrl = 'https://johnh-king.github.io/Online-CV/';

// Publish only the static CV site. Legacy API/source folders remain archival.
const publicSiteFiles = new Set([
  '/index.html',
  '/hindex.html',
  '/page4.html',
  '/page6.html',
  '/render-html/index.html'
]);

const publicSiteDirectories = new Set([
  'assets',
  'css',
  'img',
  'js',
  'lib',
  'react'
]);

const archivedPages = new Set([
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

function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function sendFile(req, res, filePath) {
  const extension = path.extname(filePath).toLowerCase();

  res.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff'
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);

  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Unable to read file.');
  });
}

function getRequestPathname(req) {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    return decodeURIComponent(requestUrl.pathname).replace(/\\/g, '/');
  } catch (error) {
    return homepage;
  }
}

function normalizeSitePath(pathname) {
  if (!pathname || pathname === '/') {
    return homepage;
  }

  const rootedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (rootedPathname.endsWith('/')) {
    return `${rootedPathname}index.html`;
  }

  return rootedPathname;
}

function isInsideDirectory(directory, filePath) {
  const relativePath = path.relative(directory, filePath);

  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function resolvePublicFilePath(pathname) {
  const relativePath = pathname.replace(/^\/+/, '');
  const filePath = path.resolve(siteRoot, relativePath);

  if (publicSiteFiles.has(pathname)) {
    return isInsideDirectory(siteRoot, filePath) ? filePath : null;
  }

  const [topLevelDirectory] = relativePath.split('/');

  if (!publicSiteDirectories.has(topLevelDirectory)) {
    return null;
  }

  const publicRoot = path.resolve(siteRoot, topLevelDirectory);

  return isInsideDirectory(publicRoot, filePath) ? filePath : null;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {
      'Allow': 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8'
    });
    res.end('Method not allowed');
    return;
  }

  const pathname = normalizeSitePath(getRequestPathname(req));
  const filePath = resolvePublicFilePath(pathname);

  if (archivedPages.has(pathname)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Link', `<${canonicalSiteUrl}>; rel="canonical"`);
  }

  if (!filePath) {
    if (!path.extname(pathname)) {
      sendFile(req, res, path.join(siteRoot, 'index.html'));
      return;
    }

    sendNotFound(res);
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(req, res, filePath);
      return;
    }

    if (!path.extname(pathname)) {
      sendFile(req, res, path.join(siteRoot, 'index.html'));
      return;
    }

    sendNotFound(res);
  });
});

server.listen(port, host, () => {
  const address = server.address();
  const actualPort = address && typeof address === 'object' ? address.port : port;
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`John King 2026 CV site available at http://${displayHost}:${actualPort}`);
});
