// @TODO: no upstream issue — under Nuxt 5's Nitro Vite environment Nuxt turns Vite's `publicDir` off and never mounts
// The dev handler that keeps Vite's transform off a URL outside its base, so a script in `public/` comes back as a
// Module exporting its own URL and a classic head script throws "Cannot use import statement outside a module"
import { resolve } from "node:path";
import { defineNuxtModule } from "nuxt/kit";
import sirv from "sirv";

// Each file in `public/` is answered as it is, ahead of the transform, by the static server Vite's own public middleware
// Is built on, which reads the type, the range and the path's bounds as Vite would. A request carrying Vite's `import`
// Or `url` query is an asset import's, which stays Vite's; any other query, a cache buster's, still gets the file
export default defineNuxtModule({
  meta: { name: "serve-public-directory" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    // Nuxt resolves its directories with forward slashes, which the server would not match on Windows
    const servePublicFile = sirv(resolve(nuxt.options.dir.public), { dev: true, etag: true });
    nuxt.hook("vite:serverCreated", (viteServer, { isClient }) => {
      if (!isClient) return;
      viteServer.middlewares.use((req, res, next) => {
        const { searchParams } = new URL(req.url ?? "", "http://localhost");
        if (searchParams.has("import") || searchParams.has("url")) {
          next();
          return;
        }
        servePublicFile(req, res, next);
      });
    });
  },
});
