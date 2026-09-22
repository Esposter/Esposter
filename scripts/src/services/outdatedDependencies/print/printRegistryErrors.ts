import type { ColorPalette } from "#src/models/outdatedDependencies/print/ColorPalette";
import type { RegistryCheckError } from "#src/models/outdatedDependencies/shared/RegistryCheckError";

import { printTable } from "#src/services/outdatedDependencies/print/printTable";

export const printRegistryErrors = (errors: RegistryCheckError[], color: ColorPalette): void => {
  if (errors.length === 0) return;

  console.log(color.red("Registry check errors"));
  printTable(
    ["Package", "Error"],
    errors.map(({ error, packageName }) => [packageName, color.red(error)]),
    color,
  );
};
