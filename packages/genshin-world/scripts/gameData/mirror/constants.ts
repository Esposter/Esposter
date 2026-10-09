import { GAME_DATA_BLOB_PATH } from "#src/services/data/constants";
import { join } from "node:path";

// The local mirror of the hosted game data: one file per object, named by its hash, filled from the dev account the
// First time a test or the parity page reads it
export const GAME_DATA_MIRROR_DIRECTORY: string = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "node_modules",
  ".cache",
  "game-data",
);
// The dev account's AppAssets path, which the mirror fills from. The scripts package keeps its own account map, and
// Neither package can import the other's tooling, so the address is written here
export const GAME_DATA_MIRROR_SOURCE_URL = `https://devstesposter001.blob.core.windows.net/app-assets/${GAME_DATA_BLOB_PATH}`;
