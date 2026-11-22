import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { KIT_OVERLAY_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readOpenspecFolderUnits } from "#src/services/sweeps/ledgerCoverage/readOpenspecFolderUnits";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// One row per kit overlay, named by its file
const readKitOverlayRows = () =>
  readdirSync(KIT_OVERLAY_DIRECTORY)
    .filter((name) => name.endsWith(".json"))
    .map((name) => `\`${name.slice(0, -".json".length)}\``);

// A Genshin spec folder holding spec folders of its own is one row for its own documents, spelled `folder/*` as the
// Engine ledger spells a directory's direct files. Each sub-folder is a row of its own, and a row naming the folder
// Would cover its subtree too: kits' 244 files are a unit no pass can read beside its 121 character rows.
const readGenshinEvidenceUnits = (): string[] => {
  const units = readOpenspecFolderUnits().filter((unit) => unit.startsWith("`openspec/specs/genshin/"));
  return units.map((unit) => {
    const folder = unit.slice(1, -1);
    return units.some((other) => other.startsWith(`\`${folder}/`)) ? `\`${folder}/*\`` : unit;
  });
};

// The entity ledgers, whose units are not cells of the area list, each with the listing that derives them, in the unit
// Cell's backticked form. A file such a ledger keeps holds only the units it has something to say about, a note or a
// Verdict, and every one of them must be a unit the listing still derives.
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
  "genshin-evidence": readGenshinEvidenceUnits,
  "kit-differs-from-source": readKitOverlayRows,
};
