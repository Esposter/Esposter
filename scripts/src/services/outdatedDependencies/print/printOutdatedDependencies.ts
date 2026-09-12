import type { ColorPalette } from "#src/models/outdatedDependencies/ColorPalette";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";

import { getColorizedLatestVersion } from "#src/services/outdatedDependencies/print/getColorizedLatestVersion";
import { printTable } from "#src/services/outdatedDependencies/print/printTable";

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
