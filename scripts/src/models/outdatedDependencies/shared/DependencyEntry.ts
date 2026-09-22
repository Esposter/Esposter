import type { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

export interface DependencyEntry {
  // The manifest that declares the entry, for a group a manifest declares rather than a workspace section; absent,
  // The group's own label is the dependent the report attributes it to
  dependent?: string;
  // The dist-tag a `renovate.json` rule follows for this package, which is then what the registry is asked for
  // In place of `latest`
  followTag?: string;
  group: DependencyGroup;
  packageName: string;
  specifier: string;
}
