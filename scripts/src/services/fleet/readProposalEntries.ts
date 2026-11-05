import type { FleetEntry } from "#src/models/fleet/FleetEntry";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { parseKeyFilePaths } from "#src/services/fleet/parseKeyFilePaths";
import { getProposalArea } from "#src/services/proposals/getProposalArea";
import { readProposalChanges } from "#src/services/proposals/readProposalChanges";

// Each open proposal unit as an entry, cheapest first: its id is its change's, its area the id's first segment, and its
// Phase the one its change is picked at. Its touch set is the paths its design's Key files table names plus the globs its
// Metadata adds, and its needs and waiting are the metadata's own, empty when the change names none
export const readProposalEntries = (files: readonly QueueFile[]): FleetEntry[] =>
  readProposalChanges(files).map(({ design, metadata, summary: { id, phase } }) => ({
    area: getProposalArea(id),
    id,
    kind: FleetEntryKind.Unit,
    lane: "",
    line: "",
    needs: metadata.needs,
    phase,
    touches: [...parseKeyFilePaths(design), ...metadata.touches],
    waiting: metadata.waiting,
  }));
