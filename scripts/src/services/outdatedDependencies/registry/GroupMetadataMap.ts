import type { GroupMetadata } from "#src/models/outdatedDependencies/GroupMetadata";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

// A catalog entry reaches the registry only when a `renovate.json` rule follows a dist-tag for it; every other
// One is checked against the lockfile. An npm entry names its own manifest as the dependent, so the label here
// Is what it falls back to.
export const GroupMetadataMap: Record<DependencyGroup, GroupMetadata> = {
  [DependencyGroup.Catalog]: { dependencyType: "", dependent: DependencyGroup.Catalog },
  [DependencyGroup.ConfigDependencies]: { dependencyType: "config", dependent: DependencyGroup.ConfigDependencies },
  [DependencyGroup.Engines]: { dependencyType: "engine", dependent: DependencyGroup.Engines },
  [DependencyGroup.Npm]: { dependencyType: "npm", dependent: DependencyGroup.Npm },
};
