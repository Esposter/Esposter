import type { Comment, Context, ESTree, Token } from "@oxlint/plugins";

import { parseOxlintDirective } from "#src/services/oxlint/sorting/parseOxlintDirective";

// A block directive governs the code below it through its enable, so it stays where it is rather than moving with an item
const checkIsBlockDirective = (comment: Comment): boolean => {
  const directive = parseOxlintDirective(comment.value)?.directive;
  return directive === "oxlint-disable" || directive === "oxlint-enable";
};

// A declaration's first decorator is part of it, so the decorators of an exported class move with the class
const computeFirstDecorator = (node: ESTree.Node): ESTree.Node => {
  const declaration =
    (node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration") && node.declaration
      ? node.declaration
      : node;
  return ("decorators" in declaration && declaration.decorators[0]) || node;
};

// The first and last thing an item is made of: its first decorator or its node, and its node, widened to the parentheses
// Wrapping it. A union or intersection member written in parentheses keeps them, since a conditional type read without
// Its parentheses means something else, and a member next to a `|` or `&` cannot have a parenthesis on both sides that
// Is not its own
const computeBounds = (
  context: Context,
  node: ESTree.Node,
): { first: ESTree.Node | Token; last: ESTree.Node | Token } => {
  const { sourceCode } = context;
  const before = sourceCode.getTokenBefore(node);
  const after = sourceCode.getTokenAfter(node);
  if (before?.value === "(" && after?.value === ")") return { first: before, last: after };
  return { first: computeFirstDecorator(node), last: node };
};

// The start of the comments directly above an item, on lines of their own, so a comment moves with what it describes:
// A comment on the line of the token before the item trails that token, and a block directive stops the run
const computeLeadingStart = (context: Context, first: ESTree.Node | Token): number => {
  const { sourceCode } = context;
  const previousToken = sourceCode.getTokenBefore(first);
  const comments = sourceCode
    .getCommentsBefore(first)
    .filter((comment) => comment.loc.start.line !== previousToken?.loc.end.line);
  let start = first.range[0];
  let lineBelow = first.loc.start.line;
  for (const comment of comments.toReversed()) {
    if (checkIsBlockDirective(comment) || comment.loc.end.line !== lineBelow - 1) break;
    start = comment.range[0];
    lineBelow = comment.loc.start.line;
  }
  return start;
};

// An item's range: the comments directly above it, its decorators, the node and any parentheses wrapping it
export const getItemRange = (context: Context, node: ESTree.Node): [number, number] => {
  const { first, last } = computeBounds(context, node);
  return [computeLeadingStart(context, first), last.range[1]];
};

// The comment an item ends with on its own last line, and the separator that closes the item when one follows it. The
// Comment is found after the separator, so one written after a `,` moves with its item too
export const getItemTrailer = (
  context: Context,
  node: ESTree.Node,
): { anchor: ESTree.Node | Token; comment?: Comment | undefined; separator?: Token | undefined } => {
  const { sourceCode } = context;
  const { last } = computeBounds(context, node);
  const nextToken = sourceCode.getTokenAfter(last);
  const separator = nextToken?.value === "," || nextToken?.value === ";" ? nextToken : undefined;
  const anchor = separator ?? last;
  const comment = sourceCode
    .getCommentsAfter(anchor)
    .findLast((candidate) => candidate.loc.start.line === anchor.loc.end.line);
  return { anchor, comment, separator };
};
