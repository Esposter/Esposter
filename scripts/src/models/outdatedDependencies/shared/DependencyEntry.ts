import type { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

export interface DependencyEntry {
  // The manifest that declares the entry, for a group a manifest declares rather than a workspace section; absent,
  // The group's own label is the dependent the report attributes it to
  dependent?: string;
  // The dist-tag the registry is asked for in place of `latest`: the one a `renovate.json` rule follows for this
  // Package, or the one its specifier installs from
  followTag?: string;
  group: DependencyGroup;
  packageName: string;
  // The version the lockfile resolved a dist-tag specifier to, which is then the current version, since the
  // Specifier names none
  resolved?: string;
  specifier: string;
}
