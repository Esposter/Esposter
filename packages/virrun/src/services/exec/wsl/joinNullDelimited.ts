// Null-delimited so any filename (spaces, newlines) survives the staged list files; consumed with `xargs -0` on the
// Delete list and `--null -T` on the archive's copy list.
export const joinNullDelimited = (paths: readonly string[]): string => paths.map((path) => `${path}\0`).join("");
