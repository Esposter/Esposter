import { ROSTER_CACHE_EXTENSION, ROSTER_CACHE_PREFIX, STATE_DIRECTORY } from "#src/services/constants";
import { join } from "node:path";

// The installed data package's version and the interface language are in the file name rather than inside the file,
// So a bump or a change of language writes a new cache instead of having to be noticed in an old one
export const getRosterCachePath = (version: string, language: string): string =>
  join(STATE_DIRECTORY, `${ROSTER_CACHE_PREFIX}${version}-${language}${ROSTER_CACHE_EXTENSION}`);
