// A count that hit the counting bound is a floor, not an exact total — the "+" keeps every surface honest
export const formatTruncationCount = (count: number, isCountCapped: boolean): string =>
  `${count}${isCountCapped ? "+" : ""}`;
