import type { ColorPalette } from "#scripts/checkDependencies/models/ColorPalette";
import type { OutdatedDependency } from "#scripts/checkDependencies/models/OutdatedDependency";

import { getColorizedLatestVersion } from "#scripts/checkDependencies/getColorizedLatestVersion";
import { printTable } from "#scripts/checkDependencies/printTable";

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
