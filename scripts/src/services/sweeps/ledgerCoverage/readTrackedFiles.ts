import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// Every tracked file but the vendored skills' files.
// A vendored skill is tracked but its publisher owns it, so the sweep scans leave it out (`readSweepFilePaths`).
export const readTrackedFiles = (): string[] => {
  const vendoredSkillDirectories = readVendoredSkillNames().map((name) => `${SKILLS_DIRECTORY}/${name}/`);
  return getNonEmptyLines(runGit(["ls-files"])).filter(
    (path) => !vendoredSkillDirectories.some((directory) => path.startsWith(directory)),
  );
};
