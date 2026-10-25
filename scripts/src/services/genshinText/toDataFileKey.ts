import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { relative, sep } from "node:path";

// The data file's key in the lock: its path under the data folder, with '/' separators and without `.json`
export const toDataFileKey = (path: string): string =>
  relative(WORLD_DATA_DIRECTORY, path)
    .split(sep)
    .join("/")
    .replace(/\.json$/u, "");
