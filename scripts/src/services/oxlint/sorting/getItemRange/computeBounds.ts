import type { Context, ESTree, Token } from "@oxlint/plugins";

import { computeFirstDecorator } from "#src/services/oxlint/sorting/getItemRange/computeFirstDecorator";

// The first and last thing an item is made of: its first decorator or its node, and its node, widened to the parentheses
// Wrapping it. A union or intersection member written in parentheses keeps them, since a conditional type read without
// Its parentheses means something else, and a member next to a `|` or `&` cannot have a parenthesis on both sides that
// Is not its own
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
