import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { StorageBucket } from "@esposter/db-schema";
import { join } from "node:path";

// The dungeons game's lock, the one committed file that names each object the game reads, from the repository root as git
// Names it. It sits beside the folder of the game's generated key map, which is gitignored
export const DUNGEONS_LOCK_REPOSITORY_PATH = "apps/web/shared/generated/hostedAssets/dungeonsLock.json";
export const DUNGEONS_LOCK_PATH: string = join(REPOSITORY_ROOT, DUNGEONS_LOCK_REPOSITORY_PATH);
// The dungeons game's files as one product: its asset folder's files, stored under its scope in the shared hosted bucket.
// The Tiled authoring files and the code beside them are unhosted, since the bundle or Tiled reads them, never the game
export const DUNGEONS_PRODUCT: HostedAssetProduct = {
  bucket: StorageBucket.PublicHostedAssets,
  lockPath: DUNGEONS_LOCK_PATH,
  lockRepositoryPath: DUNGEONS_LOCK_REPOSITORY_PATH,
  name: "dungeons",
  scopes: ["dungeons"],
  source: {
    folder: "apps/web/app/assets/dungeons",
    kind: "files",
    unhostedExtensions: [".ts", ".tiled-project", ".tmx"],
  },
};
