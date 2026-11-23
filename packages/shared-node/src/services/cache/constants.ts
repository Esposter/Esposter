import { CACHE_ROOT } from "#src/services/dataRoot/constants";
import { join } from "node:path";

// Objects named by the hex SHA-256 of their bytes, whichever source served them, so every consumer of the same content
// Shares one copy without agreeing on anything but the hash
export const HOSTED_ASSETS_MIRROR_DIRECTORY: string = join(CACHE_ROOT, "content");
