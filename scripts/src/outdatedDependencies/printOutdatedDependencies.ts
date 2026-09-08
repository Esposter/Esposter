import type { ColorPalette } from "#scripts/outdatedDependencies/models/ColorPalette";
import type { OutdatedDependency } from "#scripts/outdatedDependencies/models/OutdatedDependency";

import { getColorizedLatestVersion } from "#scripts/outdatedDependencies/getColorizedLatestVersion";
import { printTable } from "#scripts/outdatedDependencies/printTable";

export const printOutdatedDependencies = (outdatedDependencies: OutdatedDependency[], color: ColorPalette): void => {
  if (outdatedDependencies.length === 0) return;

  console.log(color.cyan("Outdated dependencies"));
  printTable(
    ["Package", "Current", "Latest", "Dependents"],
    outdatedDependencies.map(({ current, dependencyType, dependents, latest, pkg }) => {
      const packageLabel = dependencyType ? `${pkg} (${dependencyType})` : pkg;

      return [packageLabel, current, getColorizedLatestVersion(current, latest, color), dependents.join(", ")];
    }),
    color,
  );
};
