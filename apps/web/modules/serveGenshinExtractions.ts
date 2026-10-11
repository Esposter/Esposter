import { join } from "node:path";
import { addServerHandler, defineNuxtModule } from "nuxt/kit";

import {
  GENSHIN_CHARACTER_PACK_BASE_URL,
  GENSHIN_SCENE_EXPORT_BASE_URL,
} from "../shared/services/genshin/constants.ts";

// The developer's own extractions, served from disk under `nuxt dev` alone: the official character packs, whose terms
// Forbid redistributing them, and the game's exported scenes, of which nothing ships. No production build registers
// Their routes or bundles their handlers, so the world a build serves draws every character as its capsule and every
// Scene from our own stand-ins
export default defineNuxtModule({
  meta: { name: "serve-genshin-extractions" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev) return;
    for (const [handler, baseUrl] of [
      ["genshinCharacterPacks.ts", GENSHIN_CHARACTER_PACK_BASE_URL],
      ["genshinSceneExports.ts", GENSHIN_SCENE_EXPORT_BASE_URL],
    ])
      addServerHandler({
        handler: join(nuxt.options.serverDir, "development", handler),
        method: "get",
        route: `${baseUrl}/**`,
      });
  },
});
