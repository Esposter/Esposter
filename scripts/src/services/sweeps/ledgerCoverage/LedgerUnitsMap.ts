import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { KIT_OVERLAY_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The ledgers whose units are the tree's own entries rather than a pass's choice of directories, each with the
// Listing that derives its rows — one unit cell per entry, in the cell's own backticked form. Read off the
// Filesystem, the same tree the ledger's rows describe.
export const LedgerUnitsMap: Record<string, () => string[]> = {
  dependencies: () =>
    parseWorkspaceEntries(
      DependencyGroup.Catalog,
      getSection(DependencyGroup.Catalog, readFileSync(join(REPOSITORY_ROOT, "pnpm-workspace.yaml"), "utf8")),
    ).map(({ packageName }) => `\`${packageName}\``),
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
  // One row per kit, named by its overlay
  "kit-records": () =>
    readdirSync(KIT_OVERLAY_DIRECTORY)
      .filter((name) => name.endsWith(".json"))
      .map((name) => `\`${name.slice(0, -".json".length)}\``),
};
