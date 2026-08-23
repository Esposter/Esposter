import type { ColorPalette } from "#scripts/checkDependencies/models/ColorPalette";
import type { RegistryCheckError } from "#scripts/checkDependencies/models/RegistryCheckError";

import { printTable } from "#scripts/checkDependencies/printTable";

export const printRegistryErrors = (errors: RegistryCheckError[], color: ColorPalette): void => {
  if (errors.length === 0) return;

  console.log(color.red("Registry check errors"));
  printTable(
    ["Package", "Error"],
    errors.map(({ error, pkg }) => [pkg, color.red(error)]),
    color,
  );
};
