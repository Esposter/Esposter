import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { Release } from "#src/models/outdatedDependencies/shared/Release";

import { getRegistryPackageName } from "#src/services/outdatedDependencies/getRegistryPackageName";
import { readLatestVersion } from "#src/services/shared/readLatestVersion";

export const readNpmRelease = async (entry: DependencyEntry): Promise<Release> => ({
  version: await readLatestVersion(getRegistryPackageName(entry), entry.followTag),
});
