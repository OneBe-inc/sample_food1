import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const port = Number(process.env.PORT || 4317);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/sample_food1") {
      res.writeHead(308, { Location: "/sample_food1/" });
      res.end();
      return;
    }
    if (pathname.startsWith("/sample_food1/"))
      pathname = pathname.slice("/sample_food1".length);
    const file = resolve(
      root,
      "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname),
    );
    if (!file.startsWith(root + sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    });
    res.end(data);
  } catch {
    res.writeHead(404, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    });
    res.end(await readFile(resolve(root, "404.html")));
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log("Preview: http://127.0.0.1:" + port + "/sample_food1/"),
);
