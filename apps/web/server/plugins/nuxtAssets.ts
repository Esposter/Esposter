import { definePlugin } from "nitro";
import { isEvent } from "nitro/h3";
import { getResourceHeaders } from "nuxt-security-module/runtime/nitro/plugins/routeRules";

export default definePlugin(({ hooks }) => {
  // A miss under the build's folder is never kept: a file requested before its deploy has finished would stay missing
  // In Every cache that kept the answer, and a hashed file's rule is `immutable` for a year The headers are the
  // Module's, read from the rules its route resolves: the folder's rules are per file, so `_headers` Never reaches such
  // A response, and `headers: false` on the folder drops the module's own
  hooks.hook("response", (response, event) => {
    // The hook is typed with the request-only event, which the framework hands over as the full event it is
    if (!isEvent(event) || !event.url.pathname.startsWith("/_nuxt/")) return;
    for (const [name, value] of Object.entries(getResourceHeaders(event))) response.headers.set(name, value);
    if (response.status === 404) response.headers.set("Cache-Control", "no-store");
  });
});
