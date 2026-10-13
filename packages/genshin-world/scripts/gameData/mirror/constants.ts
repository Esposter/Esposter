import { GAME_DATA_BLOB_PATH } from "#src/services/data/constants";

// The dev account's AppAssets path, which the machine-wide content cache fills a miss from. The scripts package keeps its
// Own account map, and neither package can import the other's tooling, so the address is written here
export const GAME_DATA_MIRROR_SOURCE_URL = `https://devstesposter001.blob.core.windows.net/app-assets/${GAME_DATA_BLOB_PATH}`;
// Downloads in flight at once while the mirror is filled whole, which bounds the fill's memory by one wave of objects
export const MAX_CONCURRENT_MIRROR_DOWNLOADS = 16;
