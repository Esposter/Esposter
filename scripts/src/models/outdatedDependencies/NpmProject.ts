import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";

// One manifest npm installs, as the report reads it: what it declares, and what the lockfile beside it resolved.
export interface NpmProject {
  entries: DependencyEntry[];
  manifestName: string;
  manifestPath: string;
  resolvedVersions: Map<string, string>;
}
