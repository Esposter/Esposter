import type { ProposalGroup } from "#src/models/proposals/ProposalGroup";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { MAX_GENSHIN_PHASE } from "#src/services/fleet/constants";

// A heading per phase from 0 to the last Genshin phase, in order, then one for the proposals holding none. Each group keeps
// The order its summaries are given in, so the report's cheapest-first order holds within a phase
export const groupProposalsByPhase = (summaries: readonly ProposalSummary[]): ProposalGroup[] => [
  ...Array.from({ length: MAX_GENSHIN_PHASE + 1 }, (_value, phase) => ({
    heading: `Phase ${phase}`,
    summaries: summaries.filter((summary) => summary.phase === phase),
  })),
  { heading: "No phase", summaries: summaries.filter((summary) => summary.phase === undefined) },
];
