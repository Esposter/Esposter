// A length in seven-bit groups, the high bit set on every byte but the last, as .NET's BinaryWriter writes it
export const encodeLength = (length: number): number[] => {
  const bytes: number[] = [];
  let rest = length;
  while (rest >= 0x80) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>= 7;
  }
  bytes.push(rest);
  return bytes;
};
