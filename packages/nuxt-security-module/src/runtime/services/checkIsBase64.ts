// Base64 as the Basic scheme carries it, with its padding optional.
// A padded value is whole quanta of four, and an unpadded one never leaves a single character over, which no byte
// Encodes. Either is refused here, since `fromBase64` throws on it and a malformed header would answer 500, not 401
const BASE64_REGEX = /^[\d+/A-Za-z]*={0,2}$/u;
const BASE64_QUANTUM_LENGTH = 4;

export const checkIsBase64 = (value: string): boolean =>
  BASE64_REGEX.test(value) &&
  (value.endsWith("=") ? value.length % BASE64_QUANTUM_LENGTH === 0 : value.length % BASE64_QUANTUM_LENGTH !== 1);
