import { describe } from "vitest";

// A buffer of little-endian unsigned words, one for each number given
export const createWords = (...words: number[]): Buffer => {
  const buffer = Buffer.alloc(words.length * 4);
  for (const [index, word] of words.entries()) buffer.writeUInt32LE(word, index * 4);
  return buffer;
};

describe.todo("createWords");
