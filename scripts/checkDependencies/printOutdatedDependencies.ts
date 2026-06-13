import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";
import type { OutdatedDependency } from "@/checkDependencies/models/OutdatedDependency";

import { getColorizedLatestVersion } from "@/checkDependencies/getColorizedLatestVersion";
import { printTable } from "@/checkDependencies/printTable";

export const printOutdatedDependencies = (outdatedDependencies: OutdatedDependency[], color: ColorPalette): void => {
  if (outdatedDependencies.length === 0) return;

  printTable(
    ["Package", "Current", "Latest", "Dependents"],
    outdatedDependencies.map(({ current, dependencyType, dependents, latest, pkg }) => {
      const packageLabel = dependencyType ? `${pkg} (${dependencyType})` : pkg;

      return [packageLabel, current, getColorizedLatestVersion(current, latest, color), dependents.join(", ")];
    }),
    color,
  );
};
