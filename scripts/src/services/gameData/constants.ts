import { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import { GameDataTargetBlobServiceUrlMap } from "#src/services/gameData/GameDataTargetBlobServiceUrlMap";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { AzureContainer } from "@esposter/db-schema";
import { GAME_DATA_BLOB_PATH } from "genshin-world";
import { join } from "node:path";

// The lock is the one committed file that names every published object, and the only one a publish rewrites
export const GAME_DATA_LOCK_PATH: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "gameDataLock.json",
);
// The lock's path from the repository root, as git names it
export const GAME_DATA_LOCK_REPOSITORY_PATH = "packages/genshin-world/src/generated/gameDataLock.json";
export const DAY_MS: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");
// An object a lock no longer names is kept this long, so a revert within this window still resolves it
export const GAME_DATA_RETENTION_MS: number = 90 * DAY_MS;
// An object stored this recently is reused as it is, so a prune run inside the retention window cannot take it
export const GAME_DATA_REUSE_WINDOW_MS: number = GAME_DATA_RETENTION_MS / 2;
// Every object is named by its content, so it never changes and may be cached for good
export const GAME_DATA_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const MAX_CONCURRENT_BLOB_UPLOADS = 100;
// Where a step reads what another step published: the dev account, which holds every object the lock names as prod does
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const GAME_DATA_DEV_BASE_URL: string = `${GameDataTargetBlobServiceUrlMap[GameDataTarget.Dev]}/${AzureContainer.AppAssets}/${GAME_DATA_BLOB_PATH}`;
