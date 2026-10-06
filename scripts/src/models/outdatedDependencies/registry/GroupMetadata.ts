import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { Release } from "#src/models/outdatedDependencies/shared/Release";

// How a registry-checked entry is labelled in the report — the type shown beside the package, and the one dependent
// It is attributed to, since a workspace section rather than a manifest declares it — and the source it is asked of
export interface GroupMetadata {
  dependencyType: string;
  dependent: string;
  readRelease: (entry: DependencyEntry) => Promise<Release>;
}
