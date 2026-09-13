import type { MechanicalPaths } from "#src/models/coderabbit/exclusions/MechanicalPaths";

import { checkIsImportPathOnlyDiff } from "#src/services/coderabbit/exclusions/checkIsImportPathOnlyDiff";
import { PURE_RENAME_STATUS } from "#src/services/coderabbit/exclusions/constants";
import { getFileDiffs } from "#src/services/coderabbit/exclusions/getFileDiffs";
import { getNameStatusRows } from "#src/services/coderabbit/exclusions/getNameStatusRows";
import { runGit } from "#src/services/coderabbit/shared/runGit";

// Two git calls for a range of any size: the name-status listing that says which paths changed and how, and the
// Whole diff split per file. A per-file diff would be one call per path and would have to be handed the rename
// Pair to see the rename at all (`getFileDiffs`); the whole diff sees every pair on its own.
export const readMechanicalPaths = (range: string[], cwd?: string): MechanicalPaths => {
  const rows = getNameStatusRows(runGit(["diff", "--name-status", "-M", ...range], cwd));
  const mechanicalPaths = new Set(rows.filter(({ status }) => status === PURE_RENAME_STATUS).map(({ path }) => path));
  if (rows.length > mechanicalPaths.size) {
    const fileDiffs = getFileDiffs(runGit(["diff", "-U0", "-M", ...range], cwd), rows);
    for (const [path, fileDiff] of fileDiffs) if (checkIsImportPathOnlyDiff(fileDiff)) mechanicalPaths.add(path);
  }
  return { mechanicalPaths, rows };
};
