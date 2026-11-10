import { join } from "node:path";
import { addServerHandler, defineNuxtModule } from "nuxt/kit";

import { DEV_SESSION_ROUTE } from "../server/services/devSession/constants.ts";

// The session route a driven browser posts to. It is registered only under `nuxt dev`, so a production build bundles
// No handler and holds no route; under `nuxt dev` the handler's runtime gate still refuses every request it does not open
export default defineNuxtModule({
  meta: { name: "dev-session" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    addServerHandler({
      handler: join(nuxt.options.serverDir, "services", "devSession", "postDevSession.ts"),
      method: "post",
      route: DEV_SESSION_ROUTE,
    });
  },
});
