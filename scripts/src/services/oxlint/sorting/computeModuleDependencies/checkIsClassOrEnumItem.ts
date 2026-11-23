import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";

import { computeExportedDeclaration } from "#src/services/oxlint/sorting/getItemRange/computeExportedDeclaration";

// Whether a statement declares a class or an enum, the only declarations whose reads are dependencies
export const checkIsClassOrEnumItem = (item: SortingGroupItem): boolean => {
  const declaration = computeExportedDeclaration(item.node);
  return declaration.type === "ClassDeclaration" || declaration.type === "TSEnumDeclaration";
};
