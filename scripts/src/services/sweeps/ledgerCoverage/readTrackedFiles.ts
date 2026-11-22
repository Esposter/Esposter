import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";

// The tracked files under the pathspecs, every tracked file for none. A vendored skill is tracked but is its
// Publisher's, so it is left out as the sweep scans leave it out (`readSweepFilePaths`). The caller reads the vendored
// Names once and passes them in, so a run that lists many pathspecs does not re-read the lock file for each
export const readTrackedFiles = (vendoredSkillNames: string[], pathspecs: string[] = []): string[] => {
  const vendoredSkillDirectories = vendoredSkillNames.map((name) => `${SKILLS_DIRECTORY}/${name}/`);
  return getNonEmptyLines(runGit(["ls-files", "--", ...pathspecs])).filter(
    (path) => !vendoredSkillDirectories.some((directory) => path.startsWith(directory)),
  );
};
