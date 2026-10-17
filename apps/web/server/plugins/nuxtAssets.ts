import { definePlugin } from "nitro";
import { isEvent } from "nitro/h3";

export default definePlugin(({ hooks }) => {
  hooks.hook("request", (event) => {
    if (!isEvent(event)) return;
    const { pathname } = event.url;
    if (pathname.startsWith("/_nuxt/") && pathname.endsWith(".js"))
      event.res.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  });
});
