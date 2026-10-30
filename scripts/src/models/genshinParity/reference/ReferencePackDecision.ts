import type { ReferenceCollision } from "#src/models/genshinParity/reference/ReferenceCollision";
import type { ReferenceEntryPlan } from "#src/models/genshinParity/reference/ReferenceEntryPlan";

// Which plans a pack stores given its options: the collisions that refuse the run, and the collisions it leaves out.
// The ids whose rows it replaces, and the plans it stores
export interface ReferencePackDecision {
  blocked: ReferenceCollision[];
  replaced: string[];
  skipped: ReferenceCollision[];
  stored: ReferenceEntryPlan[];
}
