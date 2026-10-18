import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { parseKeyFilePaths } from "#src/services/fleet/parseKeyFilePaths";
import { parseProposalMetadata } from "#src/services/fleet/parseProposalMetadata";
import { PROPOSAL_DESIGN_FILE, PROPOSAL_METADATA_FILE, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProposalArea } from "#src/services/proposals/getProposalArea";
import { readProposalSummaries } from "#src/services/proposals/readProposalSummaries";

// Each open proposal unit as an entry: its id is its change's, its area the id's first segment. Its touch set is the
// Paths its design's Key files table names plus the globs its metadata adds, and its needs and waiting are the
// Metadata's own, empty when the change names none
export const readProposalEntries = (files: readonly QueueFile[]): FleetEntry[] => {
  const pathTextMap = new Map(files.map(({ path, text }) => [path, text]));
  return readProposalSummaries(files).map(({ id }) => {
    const design = pathTextMap.get(`${PROPOSALS_DIRECTORY}/${id}/${PROPOSAL_DESIGN_FILE}`) ?? "";
    const metadata = pathTextMap.get(`${PROPOSALS_DIRECTORY}/${id}/${PROPOSAL_METADATA_FILE}`) ?? "";
    const { needs, touches, waiting } = parseProposalMetadata(metadata);
    return {
      area: getProposalArea(id),
      id,
      kind: FleetEntryKind.Unit,
      lane: "",
      line: "",
      needs,
      touches: [...parseKeyFilePaths(design), ...touches],
      waiting,
    };
  });
};
