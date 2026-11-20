import type { ManifestDependency } from "#src/models/outdatedDependencies/shared/ManifestDependency";
import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { getDependencyType } from "#src/services/outdatedDependencies/getDependencyType";
import { getPackageLabel } from "#src/services/outdatedDependencies/print/getPackageLabel";
import { printSection } from "#src/services/outdatedDependencies/print/printSection";

export const printUncatalogedManifestDependencies = (dependencies: ManifestDependency[], color: ColorPalette): void => {
  printSection(
    color.red("Dependencies not using catalog:/workspace: specifiers"),
    ["Package", "Specifier", "Dependents"],
    dependencies.map(({ field, manifestName, packageName, specifier }) => [
      color.yellow(getPackageLabel(packageName, getDependencyType(field))),
      color.red(specifier),
      manifestName,
    ]),
    color,
  );
};
