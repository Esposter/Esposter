import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

import { toMergeField } from "@/services/emailEditor/toMergeField";
import { escapeHtml } from "@/util/text/escapeHtml";

export const substituteMergeFields = (html: string, row: Record<string, ColumnValue>): string =>
  Object.entries(row).reduce((personalizedHtml, [columnName, value]) => {
    const escapedValue = escapeHtml(String(value ?? ""));
    const mergeField = toMergeField(columnName);
    // The editor canvas entity-encodes special characters on serialization,
    // So a column name like "P&L" appears in the exported HTML as its escaped token form
    return personalizedHtml.replaceAll(mergeField, escapedValue).replaceAll(escapeHtml(mergeField), escapedValue);
  }, html);
