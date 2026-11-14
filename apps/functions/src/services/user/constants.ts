import { StorageBucket } from "@esposter/db-schema";

export const DATA_EXPORT_CONTENT_TYPE = "application/zip";
// Seven days after an export is ready, which the container's lifecycle rule and the row's expiry both read.
// Written in hours, since an instant takes no date unit: `Instant.add` rejects days, and a day is 24 hours of it
export const DATA_EXPORT_RETENTION = Temporal.Duration.from({ hours: 7 * 24 });
// The game containers that hold a person's save, keyed by the game name the archive's saves entry is named after
export const SAVE_GAME_CONTAINERS = {
  clicker: StorageBucket.ClickerAssets,
  dungeons: StorageBucket.UserAssets,
  genshin: StorageBucket.GenshinAssets,
} as const satisfies Record<string, StorageBucket>;
