import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url || "/", "http://localhost").pathname
    );
    let path = resolve(root, `.${pathname}`);
    if (!(path === root || path.startsWith(root + sep))) {
      response.writeHead(403);
      response.end();
      return;
    }
    let status = 200;
    try {
      const info = await stat(path);
      if (info.isDirectory()) path = resolve(path, "index.html");
      await stat(path);
    } catch {
      path = resolve(root, "404.html");
      status = 404;
    }
    const body = await readFile(path);
    response.writeHead(status, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control":
        extname(path) === ".html" ? "no-cache" : "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("طلب غير صالح");
  }
}).listen(port, "0.0.0.0", () =>
  console.log(
    `[Next.js static preview] http://0.0.0.0:${port} — no public deployment`
  )
);
