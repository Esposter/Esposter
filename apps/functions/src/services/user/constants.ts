import { AzureContainer } from "@esposter/db-schema";

// The archive uploads in blocks of this size, with at most the concurrency below in flight, so the upload's window is
// fixed whatever the account holds
export const DATA_EXPORT_UPLOAD_BUFFER_SIZE = 4 * 1024 * 1024;
export const DATA_EXPORT_UPLOAD_MAX_CONCURRENCY = 4;
export const DATA_EXPORT_CONTENT_TYPE = "application/zip";
// Seven days after an export is ready, which the container's lifecycle rule and the row's expiry both read
export const DATA_EXPORT_RETENTION = Temporal.Duration.from({ days: 7 });
// The directory a resource's working assets are written under. The web app writes them there too, so the two must agree
export const RESOURCE_FILES_SEGMENT = "files";
// The game containers that hold a person's save, keyed by the game name the archive's saves entry is named after
export const SAVE_GAME_CONTAINERS = {
  clicker: AzureContainer.ClickerAssets,
  dungeons: AzureContainer.DungeonsAssets,
  genshin: AzureContainer.GenshinAssets,
} as const satisfies Record<string, AzureContainer>;
