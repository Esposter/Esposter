// @TODO: no upstream issue — under Nuxt 5's Nitro Vite environment Nuxt turns Vite's `publicDir` off and never mounts
// The dev handler that keeps Vite's transform off a URL outside its base, so a script in `public/` comes back as a
// Module exporting its own URL and a classic head script throws "Cannot use import statement outside a module"
import { createReadStream, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { contentType } from "mime-types";
import { defineNuxtModule } from "nuxt/kit";

// Each file in `public/` is answered as it is, ahead of the transform, as Vite's own public middleware would. A request
// With a query is an asset import's, which stays Vite's
export default defineNuxtModule({
  meta: { name: "serve-public-directory" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    // Nuxt resolves its directories with forward slashes, which `join` would not match on Windows
    const publicDirectory = resolve(nuxt.options.dir.public);
    nuxt.hook("vite:serverCreated", (viteServer, { isClient }) => {
      if (!isClient) return;
      viteServer.middlewares.use((req, res, next) => {
        if ((req.method !== "GET" && req.method !== "HEAD") || !req.url || req.url.includes("?")) {
          next();
          return;
        }
        const path = join(publicDirectory, decodeURIComponent(req.url));
        if (!path.startsWith(`${publicDirectory}${sep}`) || !statSync(path, { throwIfNoEntry: false })?.isFile()) {
          next();
          return;
        }
        res.setHeader("Content-Type", contentType(extname(path)) || "application/octet-stream");
        if (req.method === "HEAD") {
          res.end();
          return;
        }
        const stream = createReadStream(path);
        stream.once("error", next);
        stream.pipe(res);
      });
    });
  },
});
