import type { ESTree } from "@oxlint/plugins";

import { checkIsExportStatement } from "#src/services/oxlint/sorting/getItemRange/checkIsExportStatement";

// The declaration an export statement wraps, or the node itself when it wraps none
export const computeExportedDeclaration = (node: ESTree.Node): ESTree.Node =>
  checkIsExportStatement(node) && node.declaration ? node.declaration : node;
