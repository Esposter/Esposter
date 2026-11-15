import type { CloudflareEnvironment } from "@esposter/db-schema";

import { PUBLIC_ASSETS_BASE_URL_MAP } from "#src/services/cloudflare/constants";
import { StorageBucket } from "@esposter/db-schema";

// The URL a published game data object is read under in an environment: the public bucket's name under its origin, which
// Anyone can fetch from. The assets route keys a bucket by its name in the app, not by its R2 name
export const getGameDataBaseUrl = (environment: CloudflareEnvironment): string =>
  `${PUBLIC_ASSETS_BASE_URL_MAP[environment]}/${StorageBucket.PublicGenshinAssets}`;
