import { UNIT_ID_SEPARATOR } from "#src/services/fleet/constants";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";

// The page a proposal unit is specified in, from its id: the inverse of the id `readProposalEntries` derives from the path
export const getUnitSpecPath = (id: string): string =>
  `${PROPOSALS_DIRECTORY}/${id.replaceAll(UNIT_ID_SEPARATOR, "/")}.md`;
