const tokenCountFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1, notation: "compact" });
// A token count at the precision a gauge is read at — 30.3K of 1M rather than every digit
export const formatTokenCount = (tokenCount: number): string => tokenCountFormat.format(tokenCount);
