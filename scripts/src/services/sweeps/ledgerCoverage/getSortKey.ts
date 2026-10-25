// The cell is backticked, and the backtick sorts after a hyphen — so the order is the bare name's, where a
// Name precedes its own prefix-extensions the way a directory listing reads
export const getSortKey = (unit: string): string => unit.replaceAll("`", "");
