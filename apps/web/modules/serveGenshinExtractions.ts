import { join } from "node:path";
import { addServerHandler, defineNuxtModule } from "nuxt/kit";

import { GENSHIN_SCENE_EXPORT_BASE_URL } from "../shared/services/genshin/constants.ts";

// The developer's own extraction, the game's exported scenes, served from disk under `nuxt dev` alone, of which nothing
// Ships. No production build registers its route or bundles its handler, so the world a build serves draws every scene
// From our own stand-ins
export default defineNuxtModule({
  meta: { name: "serve-genshin-extractions" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    addServerHandler({
      handler: join(nuxt.options.serverDir, "development", "genshinSceneExports.ts"),
      method: "get",
      route: `${GENSHIN_SCENE_EXPORT_BASE_URL}/**`,
    });
  },
});
