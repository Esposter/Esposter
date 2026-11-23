import type { ESTree } from "@oxlint/plugins";

import { computeExportedDeclaration } from "#src/services/oxlint/sorting/getItemRange/computeExportedDeclaration";

// A declaration's first decorator is part of it, so the decorators of an exported class move with the class
export const computeFirstDecorator = (node: ESTree.Node): ESTree.Node => {
  const declaration = computeExportedDeclaration(node);
  return ("decorators" in declaration && declaration.decorators[0]) || node;
};
