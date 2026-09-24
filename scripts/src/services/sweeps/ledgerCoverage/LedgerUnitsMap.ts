import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The ledgers whose units are the tree's own entries rather than a pass's choice of directories, each with the
// Listing that derives its rows — one unit cell per entry, in the cell's own backticked form. Read off the
// Filesystem rather than `git ls-files`, so the workspace test that holds a ledger to its listing runs inside
// Virrun's overlay, which carries the files and not the repository.
export const LedgerUnitsMap: Record<string, () => string[]> = {
  "docs/skills": () => {
    const skillsDirectory = join(REPOSITORY_ROOT, SKILLS_DIRECTORY);
    const vendoredSkillNames = readVendoredSkillNames();
    return readdirSync(skillsDirectory, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          existsSync(join(skillsDirectory, entry.name, "SKILL.md")) &&
          !vendoredSkillNames.includes(entry.name),
      )
      .map(({ name }) => `\`${name}\``);
  },
};
