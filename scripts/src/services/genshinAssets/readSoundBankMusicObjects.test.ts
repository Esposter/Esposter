import { MusicObjectType } from "#src/models/genshinAssets/MusicObjectType";
import { readSoundBankMusicObjects } from "#src/services/genshinAssets/readSoundBankMusicObjects";
import { describe, expect, test } from "vitest";

const createChunk = (tag: string, body: Buffer): Buffer => {
  const head = Buffer.alloc(8);
  head.write(tag, "latin1");
  head.writeUInt32LE(body.length, 4);
  return Buffer.concat([head, body]);
};
const createObject = (type: number, id: number, fields: Buffer): Buffer => {
  const head = Buffer.alloc(9);
  head.writeUInt8(type);
  head.writeUInt32LE(4 + fields.length, 1);
  head.writeUInt32LE(id, 5);
  return Buffer.concat([head, fields]);
};

describe(readSoundBankMusicObjects, () => {
  test("reads the hierarchy chunk's music objects past the other chunks, leaving its other objects", () => {
    expect.hasAssertions();

    const fields = Buffer.from([1, 2]);
    const count = Buffer.alloc(4);
    count.writeUInt32LE(2);
    const hierarchy = Buffer.concat([
      count,
      createObject(2, 1, fields),
      createObject(MusicObjectType.Segment, 2, fields),
    ]);
    const bank = Buffer.concat([createChunk("BKHD", Buffer.alloc(4)), createChunk("HIRC", hierarchy)]);

    expect(readSoundBankMusicObjects(bank)).toStrictEqual([{ data: fields, id: 2, type: MusicObjectType.Segment }]);
  });
});
