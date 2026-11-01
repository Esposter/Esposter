import { parseStreamingIndex } from "#src/services/genshinAssets/world/parseStreamingIndex";
import { writeUint32s } from "#src/services/genshinAssets/world/writeUint32s.test";
import { describe, expect, test } from "vitest";

describe(parseStreamingIndex, () => {
  test("reads each chunk's offset past a name that does not fill its last word", () => {
    expect.hasAssertions();

    const bytes = Buffer.concat([
      Buffer.alloc(28),
      writeUint32s(1),
      Buffer.from("a\0\0\0"),
      writeUint32s(2),
      writeUint32s(0),
      Buffer.alloc(8),
      writeUint32s(1),
      Buffer.alloc(8),
    ]);

    expect(parseStreamingIndex(bytes)).toStrictEqual([0, 1]);
  });
});
