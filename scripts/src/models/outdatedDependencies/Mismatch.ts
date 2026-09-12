import type { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

export interface Mismatch {
  group: DependencyGroup;
  pkg: string;
  resolved: string;
  specifier: string;
}
