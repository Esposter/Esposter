import type { ProposalMetadata } from "#src/models/fleet/ProposalMetadata";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

// One open proposal's change, read once: its design's text, its metadata parsed, and its summary, which carries the phase
// It is picked at, the lowest among its open tasks
export interface ProposalChange {
  design: string;
  metadata: ProposalMetadata;
  summary: ProposalSummary;
}
