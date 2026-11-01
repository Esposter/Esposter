import { describe } from "vitest";

// A buffer of little-endian 32-bit words, one for each value given
export const writeUint32s = (...values: number[]): Buffer => {
  const bytes = Buffer.alloc(values.length * 4);
  for (const [index, value] of values.entries()) bytes.writeUInt32LE(value, index * 4);
  return bytes;
};

describe.todo("writeUint32s");
