import type { Context, ESTree, Token } from "@oxlint/plugins";

import { computeFirstDecorator } from "#src/services/oxlint/sorting/getItemRange/computeFirstDecorator";

// The first and last thing an item is made of: its first decorator or node, and that node widened to its parentheses.
// Parentheses around a union or intersection member are kept, since without them a conditional type reads differently.
// A member next to a `|` or `&` cannot have a parenthesis on both sides that is not its own.
export const computeBounds = (
  context: Context,
  node: ESTree.Node,
): { first: ESTree.Node | Token; last: ESTree.Node | Token } => {
  const { sourceCode } = context;
  const before = sourceCode.getTokenBefore(node);
  const after = sourceCode.getTokenAfter(node);
  if (before?.value === "(" && after?.value === ")") return { first: before, last: after };
  return { first: computeFirstDecorator(node), last: node };
};
