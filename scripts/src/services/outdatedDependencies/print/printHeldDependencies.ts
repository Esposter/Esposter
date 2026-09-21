import type { ColorPalette } from "#src/models/outdatedDependencies/ColorPalette";
import type { HeldDependency } from "#src/models/outdatedDependencies/HeldDependency";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/OutdatedDependency";

import { getColorizedLatestVersion } from "#src/services/outdatedDependencies/print/getColorizedLatestVersion";
import { printTable } from "#src/services/outdatedDependencies/print/printTable";
import { RENOVATE_CONFIGURATION_FILE } from "#src/services/shared/constants";

export const printHeldDependencies = (heldDependencies: HeldDependency[], color: ColorPalette): void => {
  if (heldDependencies.length === 0) return;
  // A reason is a rule's description, which is prose, so it prints once above the packages it holds rather than
  // As a column each of them repeats.
  const reasonDependenciesMap = new Map<string, OutdatedDependency[]>();
  for (const { dependency, reason } of heldDependencies) {
    const dependencies = reasonDependenciesMap.get(reason) ?? [];
    dependencies.push(dependency);
    reasonDependenciesMap.set(reason, dependencies);
  }

  console.log(color.cyan(`Held by ${RENOVATE_CONFIGURATION_FILE}`));
  for (const [reason, dependencies] of reasonDependenciesMap) {
    console.log(color.yellow(reason));
    printTable(
      ["Package", "Current", "Latest"],
      dependencies.map(({ current, latest, packageName }) => [
        packageName,
        current,
        getColorizedLatestVersion(current, latest, color),
      ]),
      color,
    );
  }
};
