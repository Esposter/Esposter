import { definePlugin } from "nitro";
import { isEvent } from "nitro/h3";

export default definePlugin(({ hooks }) => {
  hooks.hook("request", (event) => {
    if (!isEvent(event)) return;
    const { pathname } = event.url;
    if (pathname.startsWith("/_nuxt/") && pathname.endsWith(".js"))
      event.res.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  });
  // Nitro's route rule for the build's folder stamps every response under it `immutable` for a year, a miss included. A
  // File requested before its deploy has finished would stay missing for that long in every cache that kept the answer
  hooks.hook("response", (response, event) => {
    if (response.status === 404 && event.url.pathname.startsWith("/_nuxt/"))
      response.headers.set("Cache-Control", "no-store");
  });
});
