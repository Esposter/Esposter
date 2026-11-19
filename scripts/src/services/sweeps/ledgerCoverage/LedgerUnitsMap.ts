import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { KIT_OVERLAY_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { getSection } from "#src/services/outdatedDependencies/workspace/getSection";
import { parseWorkspaceEntries } from "#src/services/outdatedDependencies/workspace/parseWorkspaceEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { LEDGER_DIRECTORY, SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readLedgerUnits } from "#src/services/sweeps/ledgerCoverage/readLedgerUnits";
import { readOpenspecFolderUnits } from "#src/services/sweeps/ledgerCoverage/readOpenspecFolderUnits";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// One row per kit overlay, named by its file
const readKitOverlayRows = () =>
  readdirSync(KIT_OVERLAY_DIRECTORY)
    .filter((name) => name.endsWith(".json"))
    .map((name) => `\`${name.slice(0, -".json".length)}\``);

// The tooling area's directory units, which the invariants ledger holds, so the quality and security tooling tables
// Name the same directories the invariants pass reads
const readInvariantsToolingUnits = (): string[] =>
  readLedgerUnits(readFileSync(join(REPOSITORY_ROOT, LEDGER_DIRECTORY, "invariants", "tooling.md"), "utf8"));

// The ledgers whose units are derived rather than chosen by a pass, each with the listing that derives its rows — one
// Unit cell per entry, in the cell's own backticked form. A derived listing is read off the filesystem, the same tree
// The ledger's rows describe, except the tooling tables' directories, which are the invariants ledger's, and their
// Openspec folders, which are the tree's.
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
  "genshin-evidence": () => readOpenspecFolderUnits().filter((unit) => unit.startsWith("`openspec/specs/genshin/")),
  "kit-differs-from-source": readKitOverlayRows,
  "quality/tooling": () => [...readInvariantsToolingUnits(), ...readOpenspecFolderUnits()],
  "security/tooling": () => [...readInvariantsToolingUnits(), ...readOpenspecFolderUnits()],
};
