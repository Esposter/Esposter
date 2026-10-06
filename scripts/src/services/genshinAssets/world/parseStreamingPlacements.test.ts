import { parseStreamingPlacements } from "#src/services/genshinAssets/world/parseStreamingPlacements";
import { describe, expect, test } from "vitest";

const writeFloats = (...values: number[]): Buffer => {
  const bytes = Buffer.alloc(values.length * 4);
  for (const [index, value] of values.entries()) bytes.writeFloatLE(value, index * 4);
  return bytes;
};

describe(parseStreamingPlacements, () => {
  test("reads a record's fields by its mask, vectors by theirs, and skips what places nothing", () => {
    expect.hasAssertions();

    // Every field: flags, a path hash past one byte, a prefab id, a radius, a full position, a rotation about y alone,
    // A scale of no components, an instance and a parent, then the flag bit with no bytes
    const placed = Buffer.concat([
      Buffer.from([0xff, 0x07, 0x00, 0x80, 0x01, 0x02]),
      writeFloats(1),
      Buffer.from([0x07]),
      writeFloats(1, 2, 3),
      Buffer.from([0x02]),
      writeFloats(90),
      Buffer.from([0x00, 0x00, 0x00]),
    ]);
    // A record of a prefab id alone, with no position
    const unplaced = Buffer.from([0x04, 0x01]);
    const chunk = Buffer.concat([Buffer.from([0x03, 0x00, 0x02]), placed, unplaced]);
    // A chunk of another structure, whose mask carries bits past the id and the records
    const other = Buffer.from([0x07, 0x00, 0x01, 0x04, 0x01]);
    const blob = Buffer.concat([Buffer.alloc(4), chunk, other]);

    expect(parseStreamingPlacements(blob, [0, chunk.length])).toStrictEqual([
      { pathHash: "128", position: [1, 2, 3], prefabId: 2, radius: 1, rotation: [0, 90, 0], scale: [1, 1, 1] },
    ]);
  });
});
