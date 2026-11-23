import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";

// Every tracked file. A vendored skill is tracked but is its Publisher's, so it is left out as the sweep scans leave it
// Out (`readSweepFilePaths`). The caller reads the vendored names once and passes them in, and lists the files once per run
export const readTrackedFiles = (vendoredSkillNames: string[]): string[] => {
  const vendoredSkillDirectories = vendoredSkillNames.map((name) => `${SKILLS_DIRECTORY}/${name}/`);
  return getNonEmptyLines(runGit(["ls-files"])).filter(
    (path) => !vendoredSkillDirectories.some((directory) => path.startsWith(directory)),
  );
};
