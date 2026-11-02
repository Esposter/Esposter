import { ITEM_METADATA_KEY_SET, RECORD_DIFFERENCE_HEADER } from "#shared/services/resource/sheet/commands/constants";

const LINE_BREAK_REGEX = /[\r\n]+/gu;

// A cell's text is a key or a value a user typed, so a pipe would open another cell of the row and a line break would
// End it, and both are written so the cell holds them
const toTableCell = (value: unknown) => String(value).replaceAll("|", "\\|").replaceAll(LINE_BREAK_REGEX, " ");

export const getRecordDifferenceDescription = (original: object, next: object) => {
  const keys = new Set([...Object.keys(original), ...Object.keys(next)]);
  const rows: string[] = [];
  for (const key of keys) {
    if (ITEM_METADATA_KEY_SET.has(key)) continue;
    const originalValue = (original as Record<string, unknown>)[key];
    const updatedValue = (next as Record<string, unknown>)[key];
    if (originalValue === updatedValue) continue;

    rows.push([key, originalValue, updatedValue].map((cell) => toTableCell(cell)).join(" | "));
  }
  if (rows.length === 0) return "";
  else return [RECORD_DIFFERENCE_HEADER, ...rows].join("\n");
};
