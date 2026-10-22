// One chunk per file of a range's diff, in order. Each chunk starts at its `diff --git` line and ends with its own newline,
// So the chunks concatenate back to the diff. `"".split` gives one empty entry, which is no file, so empty input gives none.
export const splitRangeDiff = (diff: string): string[] => (diff === "" ? [] : diff.split(/(?=^diff --git )/mu));
