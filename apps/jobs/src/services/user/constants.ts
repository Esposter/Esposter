import { StorageBucket } from "@esposter/db-schema";

export const DATA_EXPORT_CONTENT_TYPE = "application/zip";
// The game containers that hold a person's save, keyed by the game name the archive's saves entry is named after
export const SAVE_GAME_CONTAINERS = {
  clicker: StorageBucket.ClickerAssets,
  dungeons: StorageBucket.UserAssets,
  genshin: StorageBucket.GenshinAssets,
} as const satisfies Record<string, StorageBucket>;
