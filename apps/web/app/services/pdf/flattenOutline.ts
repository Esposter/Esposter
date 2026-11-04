import type { PdfOutline } from "vue-pdfjs-headless";

// One entry of an outline with its depth, and a key unique within the outline, which a row of a list is named by
export interface PdfOutlineEntry {
  depth: number;
  item: PdfOutline[number];
  key: string;
}

// The outline's entries in reading order, each nested entry after its parent one level deeper. A key is the entry's
// Index path, joined by dots, so no two entries share one whatever their depth
export const flattenOutline = (outline: PdfOutline, depth = 0, parentKey?: string): PdfOutlineEntry[] =>
  outline.flatMap((item, index) => {
    const key = parentKey === undefined ? `${index}` : `${parentKey}.${index}`;

    return [{ depth, item, key }, ...flattenOutline(item.items, depth + 1, key)];
  });
