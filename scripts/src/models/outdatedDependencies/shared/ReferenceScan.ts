import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { UnpinnedReference } from "#src/models/outdatedDependencies/shared/UnpinnedReference";

// What a file declaring references outside the npm ecosystem yields: the entries pinned well enough to check, and
// Every reference that is not
export interface ReferenceScan {
  entries: DependencyEntry[];
  unpinned: UnpinnedReference[];
}
