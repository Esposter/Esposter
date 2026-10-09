import { GENSHIN_CHARACTER_PACKS_DEFAULT_DIRECTORY } from "#server/services/genshin/characterPack/constants";
import { serveGenshinCharacterPack } from "#server/services/genshin/characterPack/serveGenshinCharacterPack";
import { GENSHIN_CHARACTER_PACK_BASE_URL } from "#shared/services/genshin/constants";
import { getGenshinGameDataBaseUrl } from "#shared/services/genshin/getGenshinGameDataBaseUrl";
import { defineEventHandler, useRuntimeConfig } from "nuxt/server";

// The developer's own extracted official packs, which `modules/serveGenshinCharacterPacks.ts` registers under `nuxt dev`
// Alone, so no production build holds this route
export default defineEventHandler(({ url }) =>
  serveGenshinCharacterPack(
    url.pathname.slice(GENSHIN_CHARACTER_PACK_BASE_URL.length + 1),
    process.env.GENSHIN_CHARACTER_PACKS_DIRECTORY || GENSHIN_CHARACTER_PACKS_DEFAULT_DIRECTORY,
    getGenshinGameDataBaseUrl(useRuntimeConfig().public.azure.container.baseUrl),
  ),
);
