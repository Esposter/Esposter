// The reference ids a compute item's line names by `genshin:parity compare`, the ids a screen's score is read by
const COMPARE_ID_REGEX = /genshin:parity compare (?<id>[a-z0-9-]+)/gu;

export const getCompareIds = (line: string): string[] =>
  Array.from(line.matchAll(COMPARE_ID_REGEX), ({ groups }) => groups?.id ?? "");
