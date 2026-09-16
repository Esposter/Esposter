import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";

// An outdated dependency a `renovate.json` rule keeps where it is, with the rule's own words for why.
export interface HeldDependency {
  dependency: OutdatedDependency;
  reason: string;
}
