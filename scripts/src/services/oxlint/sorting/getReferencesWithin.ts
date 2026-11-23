import type { Context, ESTree, Reference } from "@oxlint/plugins";

import { checkIsRangeContaining } from "#src/services/oxlint/sorting/checkIsRangeContaining";
import { checkIsRangeOverlapping } from "#src/services/oxlint/sorting/checkIsRangeOverlapping";

// The references the scopes of the file make inside the nodes' range
export const getReferencesWithin = (context: Context, nodes: { node: ESTree.Node }[]): Reference[] => {
  const range: [number, number] = [
    Math.min(...nodes.map(({ node }) => node.range[0])),
    Math.max(...nodes.map(({ node }) => node.range[1])),
  ];
  return context.sourceCode.scopeManager.scopes
    .filter((scope) => checkIsRangeOverlapping(range, scope.block.range))
    .flatMap((scope) => scope.references)
    .filter((reference) => checkIsRangeContaining(range, reference.identifier.range));
};
