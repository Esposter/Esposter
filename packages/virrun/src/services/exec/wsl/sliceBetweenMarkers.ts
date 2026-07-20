// The value a marked capture printed between `begin` and `end`, or "" when the pair is absent or inverted — an rc that
// Writes its own banner, or a shell that died before printing, then degrades instead of yielding a truncated value.
export const sliceBetweenMarkers = (output: string, begin: string, end: string): string => {
  const beginIndex = output.indexOf(begin);
  const endIndex = output.indexOf(end);
  if (beginIndex === -1 || endIndex === -1 || endIndex < beginIndex) return "";
  return output.slice(beginIndex + begin.length, endIndex);
};
