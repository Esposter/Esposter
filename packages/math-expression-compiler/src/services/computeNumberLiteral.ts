// The value of a number token: a decimal as it reads, or a binary, octal or hexadecimal literal with its radix point and
// Its word size. A word size reads the digits as two's complement at that many bits, so 0xFFi8 is -1
const RADIXES: Readonly<Record<string, number>> = { b: 2, o: 8, x: 16 };

// Null where the literal's digits are too large for its word size
export const computeNumberLiteral = (token: string): null | number => {
  const radix = RADIXES[token.charAt(1)];
  if (!token.startsWith("0") || radix === undefined) return Number(token);

  const [digits = "", wordSize] = token.slice(2).split("i");
  const [integerDigits = "", fractionDigits = ""] = digits.split(".");
  let value = 0;
  for (const digit of integerDigits) value = value * radix + Number.parseInt(digit, radix);
  let scale = 1 / radix;
  for (const digit of fractionDigits) {
    value += Number.parseInt(digit, radix) * scale;
    scale /= radix;
  }
  if (wordSize === undefined) return value;

  const bits = Number(wordSize);
  if (value > 2 ** bits - 1) return null;

  return value >= 2 ** (bits - 1) ? value - 2 ** bits : value;
};
