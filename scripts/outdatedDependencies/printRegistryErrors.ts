import type { ColorPalette } from "#scripts/outdatedDependencies/models/ColorPalette";
import type { RegistryCheckError } from "#scripts/outdatedDependencies/models/RegistryCheckError";

import { printTable } from "#scripts/outdatedDependencies/printTable";

export const printRegistryErrors = (errors: RegistryCheckError[], color: ColorPalette): void => {
  if (errors.length === 0) return;

  console.log(color.red("Registry check errors"));
  printTable(
    ["Package", "Error"],
    errors.map(({ error, pkg }) => [pkg, color.red(error)]),
    color,
  );
};
