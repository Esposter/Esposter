import type { SoundBankObject } from "#src/models/genshinAssets/music/SoundBankObject";
import type { SoundBankObjectType } from "#src/models/genshinAssets/music/SoundBankObjectType";

const HIERARCHY_CHUNK = "HIRC";
// A sound bank's objects of the kinds given: its chunks are a tag and a size each, and its hierarchy chunk a count of
// Objects, each a type byte, a size and an id, its fields after them
export const parseSoundBankObjects = (bank: Buffer, types: ReadonlySet<SoundBankObjectType>): SoundBankObject[] => {
  const objects: SoundBankObject[] = [];
  for (let offset = 0; offset + 8 <= bank.length; offset += 8 + bank.readUInt32LE(offset + 4)) {
    if (bank.toString("latin1", offset, offset + 4) !== HIERARCHY_CHUNK) continue;
    let objectOffset = offset + 12;
    for (let index = 0; index < bank.readUInt32LE(offset + 8); index++) {
      const type = bank.readUInt8(objectOffset);
      const size = bank.readUInt32LE(objectOffset + 1);
      if (types.has(type))
        objects.push({
          data: bank.subarray(objectOffset + 9, objectOffset + 5 + size),
          id: bank.readUInt32LE(objectOffset + 5),
          type,
        });
      objectOffset += 5 + size;
    }
  }
  return objects;
};
