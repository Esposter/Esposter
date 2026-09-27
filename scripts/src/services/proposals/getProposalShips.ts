import type { ProposalShip } from "#src/models/proposals/ProposalShip";

import { PROPOSALS_DIRECTORY, REFACTORS_FOLDER } from "#src/services/proposals/constants";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// A log printed as `%x1E%at%x1F%as%x1F` with `--name-only` under `--diff-filter=D`: each record's last field is the
// Pages the commit deleted, and a page's area is the folder under the proposals root — never a root page or a refactor
export const getProposalShips = (log: string): ProposalShip[] =>
  getGitRecords(log).flatMap(([timestamp = "", date = "", names = ""]) => {
    const areas = new Set(
      getNonEmptyLines(names)
        .filter((path) => path.startsWith(`${PROPOSALS_DIRECTORY}/`))
        .map((path) => path.slice(PROPOSALS_DIRECTORY.length + 1).split("/"))
        .filter((segments) => segments.length > 1)
        .map(([area = ""]) => area)
        .filter((area) => area !== REFACTORS_FOLDER),
    );
    return Array.from(areas, (area) => ({ area, date, timestamp: Number(timestamp) }));
  });
