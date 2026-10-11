import { join } from "node:path";
import { addServerHandler, defineNuxtModule } from "nuxt/kit";

import { GENSHIN_CHARACTER_PACK_BASE_URL } from "../shared/services/genshin/constants.ts";

// The developer's own extracted official packs, served from disk under `nuxt dev` alone: their terms forbid
// Redistributing them, so no production build registers the route or bundles its handler, and the world a build serves
// Draws every character as its capsule
export default defineNuxtModule({
  meta: { name: "serve-genshin-character-packs" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    addServerHandler({
      handler: join(nuxt.options.serverDir, "development", "genshinCharacterPacks.ts"),
      method: "get",
      route: `${GENSHIN_CHARACTER_PACK_BASE_URL}/**`,
    });
  },
});
