const ARRAY_INDEX_REGEX = /^(?:0|[1-9]\d*)$/u;
// RFC 6901's array index: digits without a leading zero, no greater than the largest index the caller allows
export const parseArrayIndex = (segment: string, maxIndex: number): number | undefined => {
  const index = Number(segment);
  return ARRAY_INDEX_REGEX.test(segment) && index <= maxIndex ? index : undefined;
};
