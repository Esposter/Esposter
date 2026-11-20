import type { Mismatch } from "#src/models/outdatedDependencies/shared/Mismatch";
import type { ColorPalette } from "#src/models/shared/ColorPalette";

import { printSection } from "#src/services/outdatedDependencies/print/printSection";

export const printMismatches = (mismatches: Mismatch[], color: ColorPalette): void => {
  printSection(
    color.yellow(
      "Specifiers out of sync with lockfile resolutions — bump pnpm-workspace.yaml or run pnpm refresh:lockfile; an npm manifest regenerates its own lockfile",
    ),
    ["Package", "Specifier", "Resolved", "Group"],
    mismatches.map(({ group, packageName, resolved, specifier }) => [
      packageName,
      color.red(specifier),
      color.green(resolved),
      group,
    ]),
    color,
  );
};
