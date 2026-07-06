import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";

import { toMergeField } from "@/services/emailEditor/toMergeField";
import { escapeHtml } from "@/util/text/escapeHtml";

export const substituteMergeFields = (html: string, row: Record<string, ColumnValue>): string =>
  Object.entries(row).reduce(
    (personalizedHtml, [columnName, value]) =>
      personalizedHtml.replaceAll(toMergeField(columnName), escapeHtml(String(value ?? ""))),
    html,
  );
