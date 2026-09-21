import type { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

export interface Mismatch {
  group: DependencyGroup;
  packageName: string;
  resolved: string;
  specifier: string;
}
