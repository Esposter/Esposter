import type { AssetType } from "#src/models/genshinAssets/shared/AssetType";

import { createHash } from "node:crypto";

// The MD5 digest a Unity object's path names it by: over the path and its type's suffix, zero padded to the next 256
// Bytes. Every name and key derived from a path reads its bytes from this digest
export const getPathDigest = (path: string, type: AssetType): Buffer => {
  const raw = Buffer.from(`${path}.${type}`, "ascii");
  const padded = Buffer.alloc(((raw.length >> 8) + 1) << 8);
  raw.copy(padded);
  return createHash("md5").update(padded).digest();
};
