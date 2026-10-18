import type { ProposalShip } from "#src/models/proposals/ProposalShip";

import { ARCHIVE_FOLDER, PROPOSALS_DIRECTORY, REFACTORS_AREA } from "#src/services/proposals/constants";
import { getProposalArea } from "#src/services/proposals/getProposalArea";
import { getProposalId } from "#src/services/proposals/getProposalId";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// A log printed as `%x1E%H%x1F%ct%x1F%cs%x1F` with `--name-only` under `--no-renames --diff-filter=D`: each record's
// Last field is the files the commit deleted, archiving a change included, and a change's area is its id's first
// Segment — never the archive's own files or a refactor
export const getProposalShips = (log: string): ProposalShip[] =>
  getGitRecords(log).flatMap(([hash = "", timestamp = "", date = "", names = ""]) => {
    const areas = new Set(
      getNonEmptyLines(names)
        .filter((path) => path.startsWith(`${PROPOSALS_DIRECTORY}/`))
        .map((path) => getProposalId(path))
        .filter((id) => id !== ARCHIVE_FOLDER)
        .map((id) => getProposalArea(id))
        .filter((area) => area !== REFACTORS_AREA),
    );
    return Array.from(areas, (area) => ({ area, date, hash, timestamp: Number(timestamp) }));
  });
