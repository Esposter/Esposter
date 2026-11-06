import { DELTA_SPECS_FOLDER, OPENSPEC_DIRECTORY } from "#src/services/openspec/constants";
import { getChangeDirectory } from "#src/services/openspec/getChangeDirectory";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { dirname } from "node:path";

const SPECS_DIRECTORY = `${OPENSPEC_DIRECTORY}/specs`;

// The folders an OpenSpec page is one statement of, each a page of it shares by design: a capability's spec and design
// Describe one thing, a change's proposal, design, tasks and deltas are one decision, and a delta restates the
// Requirement it modifies, so it belongs to the capability its path names as well. A path outside the tree has none
export const getOpenSpecOwners = (path: string): string[] => {
  if (path.startsWith(`${PROPOSALS_DIRECTORY}/`)) {
    const changeDirectory = getChangeDirectory(path);
    const [folder, ...segments] = path.slice(changeDirectory.length + 1).split("/");
    return folder === DELTA_SPECS_FOLDER
      ? [changeDirectory, `${SPECS_DIRECTORY}/${segments.slice(0, -1).join("/")}`]
      : [changeDirectory];
  }
  return path.startsWith(`${OPENSPEC_DIRECTORY}/`) ? [dirname(path)] : [];
};
