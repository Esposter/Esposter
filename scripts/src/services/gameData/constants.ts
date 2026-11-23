import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { getHostedAssetBaseUrl } from "#src/services/hostedAssets/getHostedAssetBaseUrl";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CloudflareEnvironment, StorageBucket } from "@esposter/db-schema";
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
// The product name the lock keys render under, which prefixes the keys constants and their types (`GameDataKeys`, `GameDataKey`)
export const GAME_DATA_PRODUCT_NAME = "GameData";
// Genshin's game data as one product: its objects in the public genshin bucket, each dataset a scope, named by its lock
export const GAME_DATA_PRODUCT: HostedAssetProduct = {
  bucket: StorageBucket.PublicGenshinAssets,
  lockPath: GAME_DATA_LOCK_PATH,
  lockRepositoryPath: GAME_DATA_LOCK_REPOSITORY_PATH,
  name: GAME_DATA_PRODUCT_NAME,
  scopes: Object.values(GameDataset),
  source: { kind: "records" },
};
// The nested keys a publish writes beside the lock, which code imports in place of the lock's own key strings
export const GAME_DATA_KEYS_FILE_NAME = "gameDataKeys.ts";
export const GAME_DATA_KEYS_PATH: string = join(dirname(GAME_DATA_LOCK_PATH), GAME_DATA_KEYS_FILE_NAME);
// The names of the two nested constants that file exports, which its readers find them by
export const GAME_DATA_KEYS_NAME = `${GAME_DATA_PRODUCT_NAME}Keys`;
export const GAME_DATA_INDEX_KEYS_NAME = `${GAME_DATA_PRODUCT_NAME}IndexKeys`;
// Where a step reads what another step published: the dev environment's public bucket, which holds every object the lock
// Names as prod does
export const GAME_DATA_DEV_BASE_URL: string = getHostedAssetBaseUrl(
  CloudflareEnvironment.Development,
  GAME_DATA_PRODUCT.bucket,
);
// The catalogue's record, which `genshin:data authored` publishes and `fitAreaOutlines` publishes outlined
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this template literal would otherwise infer
export const CATALOGUE_KEY: string = `${GameDataset.Catalogue}/catalogue`;
// The login's age rating, the one authored record of a dataset a fit otherwise publishes, so it is published as its key
export const AGE_RATING_KEY = "login/ageRating";
// The domains' challenge levels, which `genshin:data authored` publishes from their committed file for the world's gate
export const DOMAIN_CHALLENGE_LEVELS_KEY = "domainChallengeLevels/levels";
