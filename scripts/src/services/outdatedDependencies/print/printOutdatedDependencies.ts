import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";
import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { getColorizedLatestVersion } from "#src/services/outdatedDependencies/print/getColorizedLatestVersion";
import { getPackageLabel } from "#src/services/outdatedDependencies/print/getPackageLabel";
import { printSection } from "#src/services/outdatedDependencies/print/printSection";

export const printOutdatedDependencies = (outdatedDependencies: OutdatedDependency[], color: ColorPalette): void => {
  printSection(
    color.cyan("Outdated dependencies"),
    ["Package", "Current", "Latest", "Dependents"],
    outdatedDependencies.map(({ current, dependencyType, dependents, latest, packageName }) => [
      getPackageLabel(packageName, dependencyType),
      current,
      getColorizedLatestVersion(current, latest, color),
      dependents.join(", "),
    ]),
    color,
  );
};
