// The value a marked capture printed between `begin` and `end`, or "" when either marker is absent — an rc that
// Writes its own banner, or a shell that died before printing, then degrades instead of yielding a truncated value.
// `end` is searched from the end of `begin`, so a stray `end` in earlier MOTD noise can't collapse the capture.
export const sliceBetweenMarkers = (output: string, begin: string, end: string): string => {
  const beginIndex = output.indexOf(begin);
  if (beginIndex === -1) return "";
  const contentIndex = beginIndex + begin.length;
  const endIndex = output.indexOf(end, contentIndex);
  if (endIndex === -1) return "";
  return output.slice(contentIndex, endIndex);
};
