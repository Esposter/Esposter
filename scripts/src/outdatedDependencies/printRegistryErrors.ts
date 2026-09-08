import type { ColorPalette } from "#src/outdatedDependencies/models/ColorPalette";
import type { RegistryCheckError } from "#src/outdatedDependencies/models/RegistryCheckError";

import { printTable } from "#src/outdatedDependencies/printTable";

export const printRegistryErrors = (errors: RegistryCheckError[], color: ColorPalette): void => {
  if (errors.length === 0) return;

  console.log(color.red("Registry check errors"));
  printTable(
    ["Package", "Error"],
    errors.map(({ error, pkg }) => [pkg, color.red(error)]),
    color,
  );
};
