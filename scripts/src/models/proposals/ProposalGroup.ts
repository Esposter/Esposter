import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

// The open proposals the report lists under one heading: a phase's, or the heading "No phase" for those holding none
export interface ProposalGroup {
  heading: string;
  summaries: ProposalSummary[];
}
