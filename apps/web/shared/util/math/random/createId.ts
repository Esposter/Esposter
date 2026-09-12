import { ID_CHARACTERS } from "#shared/util/math/random/constants";

const BYTE_VALUE_COUNT = 256;

export const createId = (length: number): string => {
  const charsetLength = ID_CHARACTERS.length;
  // The bytes above the last whole charset repetition are discarded rather than wrapped, so every character
  // Is drawn with equal probability instead of the first few being over-represented
  const maxValidByte = BYTE_VALUE_COUNT - (BYTE_VALUE_COUNT % charsetLength);
  const id: string[] = [];

  while (id.length < length)
    for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
      if (byte >= maxValidByte) continue;
      id.push(ID_CHARACTERS.charAt(byte % charsetLength));
      if (id.length === length) break;
    }

  return id.join("");
};
