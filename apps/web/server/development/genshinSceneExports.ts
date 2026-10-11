import { GENSHIN_PARITY_DEFAULT_DIRECTORY, SCENE_EXPORTS_FOLDER } from "#server/services/genshin/sceneExport/constants";
import { serveGenshinSceneExport } from "#server/services/genshin/sceneExport/serveGenshinSceneExport";
import { GENSHIN_SCENE_EXPORT_BASE_URL } from "#shared/services/genshin/constants";
import { join } from "node:path";
import { defineEventHandler } from "nuxt/server";

// The developer's own exports of the game's scenes, which `modules/serveGenshinExtractions.ts` registers under
// `nuxt dev` alone, so no production build holds this route
export default defineEventHandler(({ url }) =>
  serveGenshinSceneExport(
    url.pathname.slice(GENSHIN_SCENE_EXPORT_BASE_URL.length + 1),
    join(process.env.GENSHIN_PARITY_DIRECTORY || GENSHIN_PARITY_DEFAULT_DIRECTORY, SCENE_EXPORTS_FOLDER),
  ),
);
