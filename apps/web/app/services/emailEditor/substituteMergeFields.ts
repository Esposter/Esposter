import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { escapeXml } from "#shared/util/text/escapeXml";
import { toMergeField } from "@/services/emailEditor/toMergeField";

const MERGE_FIELD_REGEX = /\{\{.*?\}\}/gu;

// The token is matched in the form the compiled html writes it: a text node escapes `&`, `<` and `>` and leaves quotes
// Alone, so a column named "P&L" is `{{P&amp;L}}` and one named "O'Brien" is `{{O'Brien}}`
// Every token is found in one pass over the original html, so a value written in is never scanned for tokens again
export const substituteMergeFields = (html: string, row: Record<string, ColumnValue>) => {
  const valueMap = new Map(
    Object.entries(row).map(([columnName, value]) => [
      escapeXml(toMergeField(columnName)),
      escapeHtml(String(value ?? "")),
    ]),
  );
  return html.replaceAll(MERGE_FIELD_REGEX, (token) => valueMap.get(token) ?? token);
};
