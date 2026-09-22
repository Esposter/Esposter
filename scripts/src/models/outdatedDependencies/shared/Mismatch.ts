import type { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

export interface Mismatch {
  group: DependencyGroup;
  packageName: string;
  resolved: string;
  specifier: string;
}
