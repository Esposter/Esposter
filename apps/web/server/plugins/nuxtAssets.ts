import { definePlugin } from "nitro";
import { isEvent } from "nitro/h3";

export default definePlugin(({ hooks }) => {
  hooks.hook("request", (event) => {
    if (!isEvent(event)) return;
    const { pathname } = event.url;
    if (pathname.startsWith("/_nuxt/") && pathname.endsWith(".js"))
      event.res.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  });
  // A miss under the build's folder is never kept: a file requested before its deploy has finished would stay missing in
  // Every cache that kept the answer, and a hashed file's rule is `immutable` for a year
  hooks.hook("response", (response, event) => {
    if (response.status === 404 && new URL(event.req.url).pathname.startsWith("/_nuxt/"))
      response.headers.set("Cache-Control", "no-store");
  });
});
