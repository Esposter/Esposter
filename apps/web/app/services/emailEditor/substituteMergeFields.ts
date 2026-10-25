import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { escapeHtml } from "#shared/util/text/escapeHtml";
import { toMergeField } from "@/services/emailEditor/toMergeField";

// The token as the compiled html writes it. A text node escapes `&`, `<` and `>` and leaves quotes alone, so a column
// Named "P&L" is `{{P&amp;L}}` and one named "O'Brien" is `{{O'Brien}}`. Every merge field in the output takes this one form
const escapeTextToken = (token: string) =>
  token.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export const substituteMergeFields = (html: string, row: Record<string, ColumnValue>) =>
  Object.entries(row).reduce(
    (personalizedHtml, [columnName, value]) =>
      personalizedHtml.replaceAll(escapeTextToken(toMergeField(columnName)), escapeHtml(String(value ?? ""))),
    html,
  );
