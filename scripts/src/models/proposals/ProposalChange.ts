import type { ProposalMetadata } from "#src/models/fleet/ProposalMetadata";
import type { ProposalTask } from "#src/models/fleet/ProposalTask";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

// One open proposal's change, read once: its design's text, its metadata parsed, its tasks each in its phase, and its
// Summary, which carries the phase it is picked at, the lowest among its open tasks
export interface ProposalChange {
  design: string;
  metadata: ProposalMetadata;
  summary: ProposalSummary;
  tasks: ProposalTask[];
}
