import type { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

export interface DependencyEntry {
  group: DependencyGroup;
  pkg: string;
  specifier: string;
}
