import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// The first UTF-16 code unit UTF-8 writes in two bytes, then in three
const TWO_BYTE_START = 0x80;
const THREE_BYTE_START = 0x800;
// A surrogate is half of a pair UTF-8 writes in four bytes, so each half is two
const SURROGATE_START = 0xd800;
const SURROGATE_END = 0xdfff;

// Measured in UTF-8 bytes, the unit a column's size is displayed in, over the JSON text the value is stored as. Counted
// From the code units rather than encoded: every command sizes each cell it touches, and an encode allocates a buffer per
// Cell, which was most of a ten thousand row insert. `JSON.stringify` escapes a lone surrogate, so every one it leaves
// Is half of a pair
export const getValueSize = (value: ColumnValue | undefined) => {
  const text = JSON.stringify(value ?? null);
  let size = text.length;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    if (code < TWO_BYTE_START) continue;
    else if (code < THREE_BYTE_START || (code >= SURROGATE_START && code <= SURROGATE_END)) size += 1;
    else size += 2;
  }
  return size;
};
