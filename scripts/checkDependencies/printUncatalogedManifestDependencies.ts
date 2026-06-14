import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";
import type { ManifestDependency } from "@/checkDependencies/models/ManifestDependency";

import { getDependencyType } from "@/checkDependencies/getDependencyType";
import { printTable } from "@/checkDependencies/printTable";

export const printUncatalogedManifestDependencies = (dependencies: ManifestDependency[], color: ColorPalette): void => {
  if (dependencies.length === 0) return;

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
