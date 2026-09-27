import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

// Cheapest first: what can be built now before what waits on another proposal, then fewer costs past its own files,
// Then fewer files. A proposal with no Key files table cannot be sized at all, so it trails everything that can.
export const compareProposalSummaries = (a: ProposalSummary, b: ProposalSummary): number =>
  Number(b.hasKeyFiles) - Number(a.hasKeyFiles) ||
  a.blockerRoutes.length - b.blockerRoutes.length ||
  a.signals.length - b.signals.length ||
  a.keyFileCount - b.keyFileCount ||
  a.path.localeCompare(b.path);
