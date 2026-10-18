import type { ProposalSignal } from "#src/models/proposals/ProposalSignal";

// One open proposal as the report sizes it
export interface ProposalSummary {
  // The ids of the open proposals its lead paragraph links, which have to ship first
  blockerIds: string[];
  // Whether it has a Key files table at all — a proposal without one cannot be sized and sorts last
  hasKeyFiles: boolean;
  id: string;
  keyFileCount: number;
  signals: ProposalSignal[];
}
