import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";

// The floats a RectTransform's layout ends its raw export with, two each: its anchor minimum, anchor maximum,
// Anchored position, size delta and pivot. Its JSON export holds the Transform's fields alone
const LAYOUT_FLOATS = 10;
const FLOAT_BYTES = 4;
// A RectTransform's layout from its raw export
export const readRectTransformLayout = (raw: Buffer): DumpedRectTransform => {
  const start = raw.length - LAYOUT_FLOATS * FLOAT_BYTES;
  const readPair = (index: number): [number, number] => [
    raw.readFloatLE(start + index * 2 * FLOAT_BYTES),
    raw.readFloatLE(start + (index * 2 + 1) * FLOAT_BYTES),
  ];
  return {
    anchoredPosition: readPair(2),
    anchorMax: readPair(1),
    anchorMin: readPair(0),
    pivot: readPair(4),
    sizeDelta: readPair(3),
  };
};
