import { describe } from "vitest";

// A buffer padded with zero bytes to the next four-byte boundary, as every field of a serialized shader is aligned
export const alignBytes = (bytes: Buffer): Buffer => Buffer.concat([bytes, Buffer.alloc((4 - (bytes.length % 4)) % 4)]);

describe.todo("alignBytes");
