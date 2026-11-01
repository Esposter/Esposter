import { alignBytes } from "#src/services/genshinAssets/materials/alignBytes.test";
import { createInt32 } from "#src/services/genshinAssets/materials/createInt32.test";
import { describe } from "vitest";

// A string as a serialized shader holds it: its length, its characters, then padding to a four-byte boundary
export const createString = (value: string): Buffer =>
  alignBytes(Buffer.concat([createInt32(value.length), Buffer.from(value)]));

describe.todo("createString");
