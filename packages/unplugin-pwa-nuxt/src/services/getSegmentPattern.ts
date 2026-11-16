const MULTI_SEGMENT_WILDCARD = "**";
const MULTI_SEGMENT_PATTERN = "(?:/.*)?";
const SINGLE_SEGMENT_PATTERN = "/[^/]+";

export const getSegmentPattern = (segment: string): string => {
  if (segment.startsWith(MULTI_SEGMENT_WILDCARD)) return MULTI_SEGMENT_PATTERN;
  if (segment.startsWith(":") || segment.startsWith("*")) return SINGLE_SEGMENT_PATTERN;
  // The leading slash is what `RegExp.escape` escapes, so the segment's own first character is never rewritten as a hex escape
  return RegExp.escape(`/${segment}`);
};
