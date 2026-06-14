import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";
import type { RegistryCheckError } from "@/checkDependencies/models/RegistryCheckError";

import { printTable } from "@/checkDependencies/printTable";

export const printRegistryErrors = (errors: RegistryCheckError[], color: ColorPalette): void => {
  if (errors.length === 0) return;

  printTable(
    ["Package", "Error"],
    errors.map(({ error, pkg }) => [pkg, color.red(error)]),
    color,
  );
};
