import type { DEPENDENCY_FIELDS } from "#scripts/outdatedDependencies/constants";

export interface ManifestDependency {
  field: (typeof DEPENDENCY_FIELDS)[number];
  manifestName: string;
  manifestPath: string;
  pkg: string;
  specifier: string;
}
