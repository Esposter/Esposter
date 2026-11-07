import {
  ASSET_PATH_INDEX_PATH,
  ASSET_PATH_INDEX_SHA256,
  ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS,
  ASSET_PATH_INDEX_URL,
} from "#src/services/genshinAssets/world/constants";
import { getFileSha256 } from "#src/services/provenance/getFileSha256";
import { fetchOk } from "#src/services/shared/fetchOk";
import { publishFile } from "#src/services/shared/publishFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { basename } from "node:path";

// Refuses a file whose SHA-256 is not the pinned one, named by the file it is
const assertPinned = (name: string, checksum: string, sha256: string): void => {
  if (checksum !== sha256)
    throw new InvalidOperationError(Operation.Read, name, `has SHA-256 ${checksum}, not the pinned one`);
};

// The community's index at its path, fetched from its source when the path holds no file. A copy that brought it (the
// `asset-index` folder is in the fleet's data) is checked against the pinned SHA-256 and refused when it differs, never
// fetched over. A fetch hashes the bytes it downloads once, and publishes them only when they are the pinned ones, through
// A partial file of its own, so a fetch cut short leaves no file a later run reads as the index
export const ensureAssetPathIndex = async (
  indexPath: string = ASSET_PATH_INDEX_PATH,
  sha256: string = ASSET_PATH_INDEX_SHA256,
): Promise<string> => {
  if (existsSync(indexPath)) {
    assertPinned(basename(indexPath), await getFileSha256(indexPath), sha256);
    return indexPath;
  }
  const response = await fetchOk(ASSET_PATH_INDEX_URL, { timeoutMs: ASSET_PATH_INDEX_TIMEOUT_MILLISECONDS });
  const index = new Uint8Array(await response.arrayBuffer());
  assertPinned(ASSET_PATH_INDEX_URL, createHash("sha256").update(index).digest("hex"), sha256);
  await publishFile(indexPath, index);
  return indexPath;
};
