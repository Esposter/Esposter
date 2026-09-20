import type { HeldDependency } from "#src/models/outdatedDependencies/HeldDependency";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";

// The outdated dependencies split by whether a `renovate.json` rule holds them where they are
export interface HeldPartition {
  held: HeldDependency[];
  outdated: OutdatedDependency[];
}
