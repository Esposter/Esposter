import { ARCHIVED_DELTA_PREFIX } from "#src/services/openspec/constants";
import { ARCHIVE_FOLDER, PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProposalId } from "#src/services/proposals/getProposalId";

// An archived change sits one folder down, so its own folder is the segment after the archive, not the archive itself
export const getChangeDirectory = (path: string): string => {
  const id = getProposalId(path);
  if (id !== ARCHIVE_FOLDER) return `${PROPOSALS_DIRECTORY}/${id}`;
  const [archivedId = ""] = path.slice(ARCHIVED_DELTA_PREFIX.length).split("/");
  return `${ARCHIVED_DELTA_PREFIX}${archivedId}`;
};
