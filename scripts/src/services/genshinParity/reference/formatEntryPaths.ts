import type { ReferenceEntryPath } from "#src/models/genshinParity/reference/ReferenceEntryPath";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { relative } from "node:path";

// Each file named by its id and its repository path, since a file name alone is the same for every variant of a screen
export const formatEntryPaths = (paths: ReferenceEntryPath[]): string =>
  paths
    .map(({ id, path }) => `${id}: ${relative(REPOSITORY_ROOT, path)}`)
    .toSorted()
    .join(", ") || "none";
