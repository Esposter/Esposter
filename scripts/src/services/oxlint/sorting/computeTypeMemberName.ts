import type { ESTree, SourceCode } from "@oxlint/plugins";

import { computeKeyName } from "#src/services/oxlint/sorting/names/computeKeyName";
import { stripTrailingSeparator } from "#src/services/oxlint/sorting/names/stripTrailingSeparator";

// The name an interface or type literal member sorts by: an identifier's name or a literal key's value.
// Any other key, and an index signature, sorts by the source text it is written with.
export const computeTypeMemberName = (
  node: ESTree.TSIndexSignature | ESTree.TSMethodSignature | ESTree.TSPropertySignature,
  sourceCode: SourceCode,
): string => {
  if (node.type === "TSIndexSignature")
    return stripTrailingSeparator(sourceCode.text.slice(node.range[0], node.typeAnnotation?.range[0] ?? node.range[1]));
  if (node.type === "TSMethodSignature")
    return computeKeyName(node.key) ?? stripTrailingSeparator(sourceCode.getText(node));
  const end = node.typeAnnotation?.range[0] ?? node.range[1] - (node.optional ? 1 : 0);
  return computeKeyName(node.key) ?? sourceCode.text.slice(node.range[0], end);
};
