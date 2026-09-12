import type { GroupMetadata } from "#src/models/outdatedDependencies/GroupMetadata";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

// The catalog is absent because its entries are checked against the lockfile, never the registry.
export const GroupMetadataMap: Partial<Record<DependencyGroup, GroupMetadata>> = {
  [DependencyGroup.ConfigDependencies]: { dependencyType: "config", dependent: DependencyGroup.ConfigDependencies },
  [DependencyGroup.Engines]: { dependencyType: "engine", dependent: DependencyGroup.Engines },
};
