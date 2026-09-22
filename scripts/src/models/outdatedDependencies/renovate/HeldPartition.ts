import type { HeldDependency } from "#src/models/outdatedDependencies/shared/HeldDependency";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";

// The outdated dependencies split by whether a `renovate.json` rule holds them where they are
export interface HeldPartition {
  held: HeldDependency[];
  outdated: OutdatedDependency[];
}
