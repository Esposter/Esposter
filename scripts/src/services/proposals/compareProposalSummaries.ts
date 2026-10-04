import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

// Cheapest first: what can be built now before what waits on another proposal, then fewer costs past its own files,
// Then fewer files. A proposal with no Key files table cannot be sized at all, so it trails everything that can.
export const compareProposalSummaries = (firstSummary: ProposalSummary, secondSummary: ProposalSummary): number =>
  Number(secondSummary.hasKeyFiles) - Number(firstSummary.hasKeyFiles) ||
  firstSummary.blockerRoutes.length - secondSummary.blockerRoutes.length ||
  firstSummary.signals.length - secondSummary.signals.length ||
  firstSummary.keyFileCount - secondSummary.keyFileCount ||
  firstSummary.path.localeCompare(secondSummary.path);
