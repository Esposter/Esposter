import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";

import { toMergeField } from "@/services/emailEditor/toMergeField";
import { escapeHtml } from "@/util/text/escapeHtml";

// The email canvas is MJML, so a bound column drags in as an mj-text carrying the canonical token.
// The token goes in escaped because the canvas entity-encodes on serialization anyway — which is why
// `substituteMergeFields` matches both the raw and the escaped form
export const createMergeFieldBlocks = (columnNames: string[]): GrapesJsBlock[] =>
  columnNames.map((columnName) => ({
    content: `<mj-text>${escapeHtml(toMergeField(columnName))}</mj-text>`,
    id: `merge-field-${columnName}`,
    label: escapeHtml(columnName),
  }));
