import type { Context, ESTree, Token } from "@oxlint/plugins";

import { checkIsBlockDirective } from "#src/services/oxlint/sorting/getItemRange/checkIsBlockDirective";

// The start of the comments directly above an item, on lines of their own, so a comment moves with what it describes:
// A comment on the line of the token before the item trails that token, and a block directive stops the run
export const computeLeadingStart = (context: Context, first: ESTree.Node | Token): number => {
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
