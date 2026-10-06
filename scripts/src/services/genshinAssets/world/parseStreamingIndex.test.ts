import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { describe, expect, test } from "vitest";

const writeUint32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32LE(value);
  return bytes;
};

describe(parseStreamingIndex, () => {
  test("reads each chunk's offset past a name that does not fill its last word", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([
      Buffer.alloc(28),
      writeUint32(1),
      Buffer.from("a\0\0\0"),
      writeUint32(2),
      writeUint32(0),
      Buffer.alloc(8),
      writeUint32(1),
      Buffer.alloc(8),
    ]);

    expect(parseStreamingIndex(bytes)).toStrictEqual([0, 1]);
  });
});
