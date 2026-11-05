import type { QueueFile } from "#src/models/fleet/QueueFile";
import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { readProposalChanges } from "#src/services/proposals/readProposalChanges";
import { readProposalFiles } from "#src/services/proposals/readProposalFiles";

// Every open proposal's summary, cheapest first, from the change files given, the working tree's when none are. Each
// Carries the phase it is picked at, read off its change
export const readProposalSummaries = (files: readonly QueueFile[] = readProposalFiles()): ProposalSummary[] =>
  readProposalChanges(files).map(({ summary }) => summary);
