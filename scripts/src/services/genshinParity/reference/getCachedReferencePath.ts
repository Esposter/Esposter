import { CONTENT_CACHE_DIRECTORY } from "@esposter/shared-node/cache";
import { join } from "node:path";

// Where a stored reference image's bytes sit in the download cache, which names each object by its hash. The restore fetches
// one that is missing there, and the setup checks for it without fetching
export const getCachedReferencePath = (sha256: string): string => join(CONTENT_CACHE_DIRECTORY, sha256);
