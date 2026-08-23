import type { ColorPalette } from "#scripts/checkDependencies/models/ColorPalette";
import type { ManifestDependency } from "#scripts/checkDependencies/models/ManifestDependency";

import { getDependencyType } from "#scripts/checkDependencies/getDependencyType";
import { printTable } from "#scripts/checkDependencies/printTable";

export const printUncatalogedManifestDependencies = (dependencies: ManifestDependency[], color: ColorPalette): void => {
  if (dependencies.length === 0) return;

  console.log(color.red("Dependencies not using catalog:/workspace: specifiers"));
  printTable(
    ["Package", "Specifier", "Dependents"],
    dependencies.map(({ field, manifestName, pkg, specifier }) => {
      const dependencyType = getDependencyType(field);
      const packageLabel = dependencyType ? `${pkg} (${dependencyType})` : pkg;

      return [color.yellow(packageLabel), color.red(specifier), manifestName];
    }),
    color,
  );
};
