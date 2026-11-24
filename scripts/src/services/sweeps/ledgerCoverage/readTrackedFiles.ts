import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { readVendoredSkillDirectories } from "#src/services/sweeps/readVendoredSkillDirectories";

// Every tracked file but the vendored skills' files.
// A vendored skill is tracked but its publisher owns it, so the sweep scans leave it out (`readSweepFilePaths`).
export const readTrackedFiles = (): string[] => {
  const vendoredSkillDirectories = readVendoredSkillDirectories();
  return getNonEmptyLines(runGit(["ls-files"])).filter(
    (path) => !vendoredSkillDirectories.some((directory) => path.startsWith(directory)),
  );
};
