import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { parseAliasSpecifier } from "#src/services/outdatedDependencies/parseAliasSpecifier";

// The package the registry publishes an entry under: an alias's target, which is also the name `pnpm outdated`
// Reports it by
export const getRegistryPackageName = ({
  packageName,
  specifier,
}: Pick<DependencyEntry, "packageName" | "specifier">): string =>
  parseAliasSpecifier(specifier)?.packageName ?? packageName;
