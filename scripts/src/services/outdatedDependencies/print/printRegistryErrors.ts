import type { ColorPalette } from "#src/models/shared/ColorPalette";
import type { RegistryCheckError } from "#src/models/shared/RegistryCheckError";

import { printSection } from "#src/services/outdatedDependencies/print/printSection";

export const printRegistryErrors = (errors: RegistryCheckError[], color: ColorPalette): void => {
  printSection(
    color.red("Registry check errors"),
    ["Package", "Error"],
    errors.map(({ error, packageName }) => [packageName, color.red(error)]),
    color,
  );
};
