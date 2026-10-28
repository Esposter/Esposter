import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { escapeXml } from "#shared/util/text/escapeXml";
import { toMergeField } from "@/services/emailEditor/toMergeField";

// The token is matched in the form the compiled html writes it: a text node escapes `&`, `<` and `>` and leaves quotes
// Alone, so a column named "P&L" is `{{P&amp;L}}` and one named "O'Brien" is `{{O'Brien}}`
// Every token is found in one pass over the original html, so a value written in is never scanned for tokens again
// The pattern is the known tokens themselves, longest first, so a column whose name ends in "}" is matched whole
export const substituteMergeFields = (html: string, row: Record<string, ColumnValue>) => {
  const valueMap = new Map(
    Object.entries(row).map(([columnName, value]) => [
      escapeXml(toMergeField(columnName)),
      escapeHtml(String(value ?? "")),
    ]),
  );
  const mergeFieldRegex = new RegExp(
    [...valueMap.keys()]
      .toSorted((firstToken, secondToken) => secondToken.length - firstToken.length)
      .map((token) => RegExp.escape(token))
      .join("|"),
    "gu",
  );
  return html.replaceAll(mergeFieldRegex, (token) => valueMap.get(token) ?? token);
};
