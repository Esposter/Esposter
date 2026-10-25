// A delta time as MIDI writes it, a variable-length quantity: seven bits a byte, most significant byte first, with the
// High bit set on every byte but the last
export const writeVariableLength = (value: number): number[] => {
  const bytes: number[] = [value & 0x7f];
  for (let rest = value >> 7; rest > 0; rest >>= 7) bytes.unshift((rest & 0x7f) | 0x80);
  return bytes;
};
