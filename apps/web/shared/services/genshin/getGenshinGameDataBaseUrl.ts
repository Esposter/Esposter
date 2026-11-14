import { StorageBucket } from "@esposter/db-schema";

// Where the hosted game data sits under the public assets domain, which serves each public R2 bucket under its own name.
// The world reads its tables, its words and its characters' names from there
export const getGenshinGameDataBaseUrl = (publicAssetsBaseUrl: string): string =>
  `${publicAssetsBaseUrl}/${StorageBucket.PublicGenshinAssets}`;
