import { getGameDataBaseUrl } from "#src/services/gameData/getGameDataBaseUrl";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CloudflareEnvironment } from "@esposter/db-schema";
import { GameDataset } from "genshin-world";
import { dirname, join } from "node:path";

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
// The nested keys a publish writes beside the lock, which code imports in place of the lock's own key strings
export const GAME_DATA_KEYS_FILE_NAME = "gameDataKeys.ts";
export const GAME_DATA_KEYS_PATH: string = join(dirname(GAME_DATA_LOCK_PATH), GAME_DATA_KEYS_FILE_NAME);
// The names of the two nested constants that file exports, which its readers find them by
export const GAME_DATA_KEYS_NAME = "GameDataKeys";
export const GAME_DATA_INDEX_KEYS_NAME = "GameDataIndexKeys";
// The line that closes each constant `renderConstant` writes, after its body
export const RENDERED_CONSTANT_CLOSING = "} as const;";
export const DAY_MS: number = Temporal.Duration.from({ hours: 24 }).total("milliseconds");
// An object a lock no longer names is kept this long, so a revert within this window still resolves it
export const GAME_DATA_RETENTION_MS: number = 90 * DAY_MS;
// An object stored this recently is reused as it is, so a prune run inside the retention window cannot take it
export const GAME_DATA_REUSE_WINDOW_MS: number = GAME_DATA_RETENTION_MS / 2;
// Every object is named by its content, so it never changes and may be cached for good
export const GAME_DATA_CACHE_CONTROL = "public, max-age=31536000, immutable";
// Requests in flight at once against one bucket, for the writes and the deletes a publish or a prune makes
export const MAX_CONCURRENT_OBJECT_REQUESTS = 100;
// Fetches in flight at once against one account, which keeps a check's memory bounded by one wave of objects
export const MAX_CONCURRENT_VERIFY_FETCHES = 16;
// Where a step reads what another step published: the dev environment's public bucket, which holds every object the lock
// Names as prod does
export const GAME_DATA_DEV_BASE_URL: string = getGameDataBaseUrl(CloudflareEnvironment.Development);
// The catalogue's record, which `genshin:data authored` publishes and `fitAreaOutlines` publishes outlined
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const CATALOGUE_KEY: string = `${GameDataset.Catalogue}/catalogue`;
// The login's age rating, the one authored record of a dataset a fit otherwise publishes, so it is published as its key
export const AGE_RATING_KEY = "login/ageRating";
// The domains' challenge levels, which `genshin:data authored` publishes from their committed file for the world's gate
export const DOMAIN_CHALLENGE_LEVELS_KEY = "domainChallengeLevels/levels";
