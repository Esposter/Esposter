import { StorageBucket } from "@esposter/db-schema";

export const DATA_EXPORT_CONTENT_TYPE = "application/zip";
// How many of a room's messages one read of its object returns, so a room's history is archived a page at a time
export const DATA_EXPORT_MESSAGE_PAGE_LIMIT = 100;
// The game containers that hold a person's save, keyed by the game name the archive's saves entry is named after
export const SAVE_GAME_CONTAINERS = {
  clicker: StorageBucket.ClickerAssets,
  dungeons: StorageBucket.UserAssets,
  genshin: StorageBucket.GenshinAssets,
} as const satisfies Record<string, StorageBucket>;
