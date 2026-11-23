import { definePlugin } from "nitro";

// The headers a page carries, which a response the Worker writes under the build's folder takes too: the folder's rules
// Are per file, so `_headers` never reaches such a response, and `headers: false` on the folder drops the module's own
const BUILD_FOLDER_HEADERS = {
  "Cross-Origin-Embedder-Policy": "credentialless",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
};

export default definePlugin(({ hooks }) => {
  // A miss under the build's folder is never kept: a file requested before its deploy has finished would stay missing in
  // Every cache that kept the answer, and a hashed file's rule is `immutable` for a year
  hooks.hook("response", (response, event) => {
    if (!new URL(event.req.url).pathname.startsWith("/_nuxt/")) return;
    for (const [name, value] of Object.entries(BUILD_FOLDER_HEADERS)) response.headers.set(name, value);
    if (response.status === 404) response.headers.set("Cache-Control", "no-store");
  });
});
