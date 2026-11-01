import { describe } from "vitest";

// A signed little-endian word as a serialized shader holds it
export const createInt32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32LE(value);
  return bytes;
};

describe.todo("createInt32");
