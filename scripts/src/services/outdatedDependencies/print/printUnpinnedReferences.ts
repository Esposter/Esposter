import type { ColorPalette } from "#src/models/outdatedDependencies/print/ColorPalette";
import type { UnpinnedReference } from "#src/models/outdatedDependencies/shared/UnpinnedReference";

import { printTable } from "#src/services/outdatedDependencies/print/printTable";

export const printUnpinnedReferences = (references: UnpinnedReference[], color: ColorPalette): void => {
  if (references.length === 0) return;

  console.log(color.red("References not pinned to a versioned tag and a digest"));
  printTable(
    ["Reference", "File"],
    references.map(({ path, reference }) => [color.red(reference), path]),
    color,
  );
};
