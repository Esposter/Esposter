import type { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

export interface DependencyEntry {
  // The dist-tag a `renovate.json` rule follows for this package, which is then what the registry is asked for
  // In place of `latest`
  followTag?: string;
  group: DependencyGroup;
  pkg: string;
  specifier: string;
}
