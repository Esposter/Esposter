import type { ProposalSignal } from "#src/models/proposals/ProposalSignal";

// One open proposal as the report sizes it
export interface ProposalSummary {
  // The routes of the open proposals its lead paragraph links, which have to ship first
  blockerRoutes: string[];
  // Whether it has a Key files table at all — a proposal without one cannot be sized and sorts last
  hasKeyFiles: boolean;
  keyFileCount: number;
  path: string;
  route: string;
  signals: ProposalSignal[];
}
