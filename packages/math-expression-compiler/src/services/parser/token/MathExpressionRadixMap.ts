// The radix that a `0` followed by one of these prefixes opens a literal in, with the digits that radix takes
export const MathExpressionRadixMap: Readonly<Record<string, { digit: RegExp; radix: number }>> = {
  b: { digit: /^[01]$/u, radix: 2 },
  o: { digit: /^[0-7]$/u, radix: 8 },
  x: { digit: /^[0-9a-fA-F]$/u, radix: 16 },
};
