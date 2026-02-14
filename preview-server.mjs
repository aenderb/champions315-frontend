/**
 * Servidor de preview que serve o build estático
 * e faz proxy das chamadas /api para o backend.
 */
import { createServer, request as httpRequest } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = join(__dirname, "dist");
const API_TARGET = "http://localhost:3333";
const PORT = 4173;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
};

const server = createServer((req, res) => {
  // Proxy /api → backend
  if (req.url.startsWith("/api")) {
    const url = new URL(req.url, API_TARGET);
    const proxyReq = httpRequest(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: req.method,
        headers: { ...req.headers, host: url.host },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on("error", () => {
      res.writeHead(502);
      res.end("Bad Gateway");
    });
    req.pipe(proxyReq);
    return;
  }

  // Servir arquivos estáticos do dist/
  let filePath = join(DIST, req.url === "/" ? "index.html" : req.url);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // SPA fallback
    filePath = join(DIST, "index.html");
  }

  const ext = extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Preview server running:`);
  console.log(`  Local:   http://localhost:${PORT}/`);
  console.log(`  Network: http://0.0.0.0:${PORT}/`);
});
