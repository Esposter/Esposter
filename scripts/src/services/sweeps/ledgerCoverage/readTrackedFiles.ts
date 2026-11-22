import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// The tracked files under the pathspecs, every tracked file for none. A vendored skill is tracked but is its
// Publisher's, so it is left out as the sweep scans leave it out (`readSweepFilePaths`)
export const readTrackedFiles = (pathspecs: string[] = []): string[] => {
  const vendoredSkillDirectories = readVendoredSkillNames().map((name) => `${SKILLS_DIRECTORY}/${name}/`);
  return getNonEmptyLines(runGit(["ls-files", "--", ...pathspecs])).filter(
    (path) => !vendoredSkillDirectories.some((directory) => path.startsWith(directory)),
  );
};
