import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { escapeXml } from "#shared/util/text/escapeXml";
import { toMergeField } from "@/services/emailEditor/toMergeField";

// The token is matched in the form the compiled html writes it: a text node escapes `&`, `<` and `>` and leaves quotes
// Alone, so a column named "P&L" is `{{P&amp;L}}` and one named "O'Brien" is `{{O'Brien}}`
export const substituteMergeFields = (html: string, row: Record<string, ColumnValue>) =>
  Object.entries(row).reduce(
    (personalizedHtml, [columnName, value]) =>
      personalizedHtml.replaceAll(escapeXml(toMergeField(columnName)), escapeHtml(String(value ?? ""))),
    html,
  );
