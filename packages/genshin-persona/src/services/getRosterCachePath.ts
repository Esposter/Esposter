import { ROSTER_CACHE_EXTENSION, ROSTER_CACHE_PREFIX, STATE_DIRECTORY } from "#src/services/constants";
import { join } from "node:path";

// The installed data package's version is in the file name rather than inside the file, so a bump writes a new
// cache instead of having to be noticed in an old one
export const getRosterCachePath = (version: string): string =>
  join(STATE_DIRECTORY, `${ROSTER_CACHE_PREFIX}${version}${ROSTER_CACHE_EXTENSION}`);
