import { REFERENCE_OBJECT_EXTENSION } from "#src/services/genshinParity/reference/constants";
import { downloadReferenceObject } from "#src/services/genshinParity/reference/downloadReferenceObject";
import { getCachedReferencePath } from "#src/services/genshinParity/reference/getCachedReferencePath";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { readContentAddressedObject } from "@esposter/shared-node/cache";
import { existsSync } from "node:fs";

// Where a stored reference image's bytes are on this machine. The download cache names each object by its hash, which is
// the hash the manifest holds, so the cache's own copy is the file read, fetched and checked into the cache first when missing
export const readCachedReference = async (sha256: string): Promise<string> => {
  const path = getCachedReferencePath(sha256);
  if (!existsSync(path))
    await readContentAddressedObject(sha256, () =>
      downloadReferenceObject(getObjectBlobName(sha256, REFERENCE_OBJECT_EXTENSION)),
    );
  return path;
};
