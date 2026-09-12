import type { ESTree } from "@oxlint/plugins";

import { collectOwnNodes } from "#src/services/oxlint/persistThenNotify/collectOwnNodes";

// Every value a block's promise can settle OR reject on: the arguments of its `return`s (what it resolves to,
// Which chains if a promise) and of its `await`s (what a rejection propagates from). A block with neither
// Settles on `undefined`, which never rejects — reading only the returns would miss a bare `await g(x)` in a
// Block body, deeming the whole fan-out safe
export const getBlockEffects = (value: unknown): ESTree.Expression[] =>
  collectOwnNodes(value, (node) => {
    if (node.type === "ReturnStatement") return node.argument ? [node.argument] : [];
    else if (node.type === "AwaitExpression") return [node.argument];
    else return undefined;
  });
