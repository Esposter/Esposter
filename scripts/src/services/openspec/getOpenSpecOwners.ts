import { OPENSPEC_DIRECTORY } from "#src/services/openspec/constants";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { getProposalId } from "#src/services/proposals/getProposalId";
import { dirname } from "node:path";

const SPECS_DIRECTORY = `${OPENSPEC_DIRECTORY}/specs`;
const DELTA_SPECS_FOLDER = "specs";

// The folders an OpenSpec page is one statement of, each a page of it shares by design: a capability's spec and design
// Describe one thing, a change's proposal, design, tasks and deltas are one decision, and a delta restates the
// Requirement it modifies, so it belongs to the capability its path names as well. A path outside the tree has none
export const getOpenSpecOwners = (path: string): string[] => {
  if (path.startsWith(`${PROPOSALS_DIRECTORY}/`)) {
    const id = getProposalId(path);
    const changeDirectory = `${PROPOSALS_DIRECTORY}/${id}`;
    const [folder, ...segments] = path.slice(changeDirectory.length + 1).split("/");
    return folder === DELTA_SPECS_FOLDER
      ? [changeDirectory, `${SPECS_DIRECTORY}/${segments.slice(0, -1).join("/")}`]
      : [changeDirectory];
  }
  return path.startsWith(`${OPENSPEC_DIRECTORY}/`) ? [dirname(path)] : [];
};
