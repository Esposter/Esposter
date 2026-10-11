import type { ColorPalette } from "#src/models/outdatedDependencies/print/ColorPalette";
import type { SupersededRepository } from "#src/models/outdatedDependencies/shared/SupersededRepository";

import { printTable } from "#src/services/outdatedDependencies/print/printTable";

export const printSupersededRepositories = (repositories: SupersededRepository[], color: ColorPalette): void => {
  if (repositories.length === 0) return;

  console.log(color.red("Packages whose repository was renamed or archived"));
  printTable(
    ["Package", "Repository", "Now", "Successor"],
    repositories.map(({ isArchived, packageName, renamedTo, repository, successor }) => [
      color.red(packageName),
      repository,
      renamedTo || (isArchived ? "archived" : ""),
      successor,
    ]),
    color,
  );
};
