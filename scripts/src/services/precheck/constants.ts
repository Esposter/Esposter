import { PACKAGES_DIRECTORY } from "#src/services/package/new/constants";
import { join } from "node:path";

// An export line a barrel generator writes for a module in a subdirectory, which the path between `./` and the file names,
// Nested directories included, since a package's lazy directory can be one (`services/character/avatar`)
export const EXPORT_LINE_DIRECTORY_REGEX: RegExp = /^export \* from "\.\/(?<directory>.+)\/[^/"]+";$/u;
// The configuration package's built entry, which carries the generator every package's build runs
export const CONFIGURATION_DISTRIBUTION_PATH: string = join(PACKAGES_DIRECTORY, "configuration", "dist", "index.js");
export const SOURCE_DIRECTORY_NAME = "src";
