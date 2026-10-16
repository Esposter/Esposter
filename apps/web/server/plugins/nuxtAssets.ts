import { definePlugin } from "nitro";

export default definePlugin(({ hooks }) => {
  hooks.hook("request", (event) => {
    const { pathname } = event.url;
    if (pathname.startsWith("/_nuxt/") && pathname.endsWith(".js"))
      event.res.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  });
});
