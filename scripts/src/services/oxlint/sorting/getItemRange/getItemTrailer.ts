import type { Comment, Context, ESTree, Token } from "@oxlint/plugins";

import { computeBounds } from "#src/services/oxlint/sorting/getItemRange/computeBounds";

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
