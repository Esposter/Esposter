import type { UnpinnedReference } from "#src/models/outdatedDependencies/shared/UnpinnedReference";
import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { printSection } from "#src/services/outdatedDependencies/print/printSection";

export const printUnpinnedReferences = (references: UnpinnedReference[], color: ColorPalette): void => {
  printSection(
    color.red("References not pinned to a versioned tag and a digest"),
    ["Reference", "File"],
    references.map(({ path, reference }) => [color.red(reference), path]),
    color,
  );
};
