import { parseCabMap } from "#src/services/genshinAssets/shared/parseCabMap";
import { describe, expect, test } from "vitest";

// A string as .NET's BinaryWriter writes one: its length in seven-bit groups, the high bit set while more follow
const writeString = (text: string): Buffer => {
  const bytes = Buffer.from(text);
  const length: number[] = [];
  for (let rest = bytes.length; ; rest >>= 7) {
    if (rest < 0x80) {
      length.push(rest);
      break;
    }
    length.push((rest & 0x7f) | 0x80);
  }
  return Buffer.concat([Buffer.from(length), bytes]);
};
const writeInt32 = (value: number): Buffer => {
  const bytes = Buffer.alloc(4);
  bytes.writeInt32LE(value);
  return bytes;
};

describe(parseCabMap, () => {
  test("reads each CAB's block and its dependencies in order, lowercase, a length past one byte included", () => {
    expect.hasAssertions();

    // A name of 128 characters takes a second byte for its length
    const longName = `cab-${"a".repeat(124)}`;
    const bytes = Buffer.concat([
      writeString(""),
      writeInt32(2),
      writeString("CAB-A"),
      writeString(String.raw`00\a.blk`),
      Buffer.alloc(8),
      writeInt32(1),
      writeString(longName),
      writeString(longName.toUpperCase()),
      writeString(String.raw`00\b.blk`),
      Buffer.alloc(8),
      writeInt32(0),
    ]);

    expect(parseCabMap(bytes)).toStrictEqual(
      new Map([
        ["cab-a", { block: "00/a.blk", dependencies: [longName] }],
        [longName, { block: "00/b.blk", dependencies: [] }],
      ]),
    );
  });
});
