const RECORD_HEADER_REGEX = /^export const \w+: Record</u;
const RECORD_END_REGEX = /^\};$/u;
// A row keyed by an enum member, a comment on the rows, or the closing bracket of a row
const RECORD_ROW_REGEX = /^\s*(?:\[\w+\.\w+\]:|\/\/|[\]}]+[,;]?$)/u;

// The 1-based lines of a `Record` keyed by an enum: its header and its rows, up to the record's own closing brace.
// Rows of values keyed by the enum's members are data a table holds, so a copy of only those is not duplicated logic.
export const getRecordRowLines = (text: string): Set<number> => {
  const recordRowLines = new Set<number>();
  let isInRecord = false;
  for (const [index, line] of text.split("\n").entries()) {
    if (RECORD_HEADER_REGEX.test(line)) isInRecord = true;
    if (!isInRecord) continue;
    if (RECORD_HEADER_REGEX.test(line) || RECORD_ROW_REGEX.test(line)) recordRowLines.add(index + 1);
    if (RECORD_END_REGEX.test(line)) isInRecord = false;
  }
  return recordRowLines;
};
