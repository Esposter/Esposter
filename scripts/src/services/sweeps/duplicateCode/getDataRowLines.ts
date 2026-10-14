// A row holds one literal: a number, a hex number or a `"#rrggbb"` colour, optionally keyed, with its separator. A line
// Of brackets, a `key: [` opener or the header of a record of primitives only frames rows, so it is data as well.
const DATA_ROW_REGEX =
  /^\s*(?:(?:\w+|"[^"]*")\s*:\s*)?(?:-?(?:\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?|0x[\da-f]+)|"#[\da-f]{3,8}")\s*,?$/iu;
// A one-line object of numeric fields is a row too, such as a measured rectangle
const DATA_OBJECT_ROW_REGEX = /^\s*\{(?:\s*\w+\s*:\s*-?\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\s*,?)+\s*\},?$/u;
const DATA_FRAME_REGEX = /^\s*(?:[{}[\]]+|\w+\s*:\s*\[|export const \w+: Record<\w+, \w+> = \{)[,;]?$/u;

// The 1-based lines of a file that are data rows of numeric or hex literals, or the lines framing them. A copy of only
// Those lines is a copy of a table, not of logic.
export const getDataRowLines = (text: string): Set<number> => {
  const dataRowLines = new Set<number>();
  for (const [index, line] of text.split("\n").entries())
    if (DATA_ROW_REGEX.test(line) || DATA_OBJECT_ROW_REGEX.test(line) || DATA_FRAME_REGEX.test(line))
      dataRowLines.add(index + 1);
  return dataRowLines;
};
