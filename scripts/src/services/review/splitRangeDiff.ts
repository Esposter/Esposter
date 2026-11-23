// One chunk per file of a range's diff, in order. Each chunk starts at its `diff --git` line and ends with its own
// Newline, So the chunks concatenate back to the diff. `"".split` gives one empty entry, which is no file, so empty
// Input gives none.
// oxlint-disable-next-line selector-ban/no-restricted-syntax -- a diff's text, whose spaces are content
export const splitRangeDiff = (diff: string): string[] => (diff === "" ? [] : diff.split(/(?=^diff --git )/mu));
