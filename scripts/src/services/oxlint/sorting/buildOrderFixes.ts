import type { Context, ESTree, Fix, Fixer } from "@oxlint/plugins";

import { getItemRange } from "#src/services/oxlint/sorting/getItemRange";
import { getItemTrailer } from "#src/services/oxlint/sorting/getItemRange/getItemTrailer";
import { takeOne } from "@esposter/shared";

// Each slot takes the item sorted into its place: the item's text replaces the slot's text, and its trailing comment
// Replaces the slot's trailing comment. A separator stays in its slot, so the list keeps the commas it had
export const buildOrderFixes = (
  context: Context,
  fixer: Fixer,
  items: { node: ESTree.Node }[],
  sortedItems: { node: ESTree.Node }[],
  isSafetySemicolonNeeded = false,
): Fix[] => {
  const { sourceCode } = context;
  const getText = (range: [number, number]): string => sourceCode.text.slice(...range);
  return items.flatMap((item, index) => {
    const sortedNode = takeOne(sortedItems, index).node;
    if (sortedNode === item.node) return [];
    const slot = getItemTrailer(context, item.node);
    const sorted = getItemTrailer(context, sortedNode);
    let sortedText = getText(getItemRange(context, sortedNode));
    const isNextTokenOnSameLine = sourceCode.getTokenAfter(item.node)?.loc.start.line === item.node.loc.end.line;
    if (
      isSafetySemicolonNeeded &&
      !sourceCode.getText(sortedNode).endsWith(";") &&
      !sourceCode.getText(sortedNode).endsWith(",") &&
      slot.separator === undefined &&
      isNextTokenOnSameLine
    )
      sortedText += ";";
    const fixes = [fixer.replaceTextRange(getItemRange(context, item.node), sortedText)];
    const sortedTrailerText = sorted.comment ? getText([sorted.anchor.range[1], sorted.comment.range[1]]) : "";
    if (slot.comment)
      fixes.push(fixer.replaceTextRange([slot.anchor.range[1], slot.comment.range[1]], sortedTrailerText));
    else if (sortedTrailerText)
      fixes.push(fixer.insertTextAfterRange([slot.anchor.range[1], slot.anchor.range[1]], sortedTrailerText));
    return fixes;
  });
};
