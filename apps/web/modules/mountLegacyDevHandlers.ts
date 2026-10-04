// @TODO: no upstream issue — Nuxt 5's Nitro 2 compatibility widens a routed dev handler to its subtree only when it is
// Middleware, but Nitro 2 mounted every dev handler on its route as a prefix, so `@nuxt/fonts` answers no font file
import { defineNuxtModule } from "nuxt/kit";

// Where Nuxt records the server API a handler was registered for, which a module built on an older kit leaves unset
const SERVER_API_KEY = Symbol.for("nuxt.serverApi");
const LEGACY_SERVER_API = "nitro2";
// Nitro 2 mounted every dev handler with `app.use(route)`, which ran it for every path below its route and stripped the
// Route from `event.path`. Nuxt 5 reproduces that only for middleware, so each Nitro 2 dev handler with a route is
// Marked as middleware once every module has registered its own
export default defineNuxtModule({
  meta: { name: "mount-legacy-dev-handlers" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    nuxt.hook("modules:done", () => {
      for (const devServerHandler of nuxt.options.devServerHandlers) {
        const serverApi: unknown = Reflect.get(devServerHandler, SERVER_API_KEY) ?? LEGACY_SERVER_API;
        if (devServerHandler.route && serverApi === LEGACY_SERVER_API) devServerHandler.middleware = true;
      }
    });
  },
});
