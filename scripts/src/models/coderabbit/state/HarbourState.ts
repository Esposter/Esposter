import type { BranchShas } from "#src/models/coderabbit/collect/BranchShas";
import type { GateDecision } from "#src/models/coderabbit/collect/GateDecision";

// The collector's state as the agent console's harbour draws it: the commits `ai/queue` owes `develop`, the ones an
// Express cut claimed, the commits parked on held branches, and the release pull request's gate when one is open
export interface HarbourState {
  branchShas: BranchShas;
  claimedShas: string[];
  gate?: GateDecision;
  heldShas: string[];
  owedShas: string[];
}
