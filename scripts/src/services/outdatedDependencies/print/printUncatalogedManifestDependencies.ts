import type { ManifestDependency } from "#src/models/outdatedDependencies/shared/ManifestDependency";
import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { getDependencyType } from "#src/services/outdatedDependencies/getDependencyType";
import { printTable } from "#src/services/outdatedDependencies/print/printTable";

export const printUncatalogedManifestDependencies = (dependencies: ManifestDependency[], color: ColorPalette): void => {
  if (dependencies.length === 0) return;

  console.log(color.red("Dependencies not using catalog:/workspace: specifiers"));
  printTable(
    ["Package", "Specifier", "Dependents"],
    dependencies.map(({ field, manifestName, packageName, specifier }) => {
      const dependencyType = getDependencyType(field);
      const packageLabel = dependencyType ? `${packageName} (${dependencyType})` : packageName;

      return [color.yellow(packageLabel), color.red(specifier), manifestName];
    }),
    color,
  );
};
