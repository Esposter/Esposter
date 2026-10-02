import type { MusicObject } from "#src/models/genshinAssets/MusicObject";

import { MusicObjectType } from "#src/models/genshinAssets/MusicObjectType";

const HIERARCHY_CHUNK = "HIRC";
const MUSIC_OBJECT_TYPES = new Set<number>(Object.values(MusicObjectType).filter((value) => typeof value === "number"));
// A sound bank's music objects: its chunks are a tag and a size each, and its hierarchy chunk a count of objects, each
// A type byte, a size and an id, its fields after them
export const readSoundBankMusicObjects = (bank: Buffer): MusicObject[] => {
  const objects: MusicObject[] = [];
  for (let offset = 0; offset + 8 <= bank.length; offset += 8 + bank.readUInt32LE(offset + 4)) {
    if (bank.toString("latin1", offset, offset + 4) !== HIERARCHY_CHUNK) continue;
    let objectOffset = offset + 12;
    for (let index = 0; index < bank.readUInt32LE(offset + 8); index++) {
      const type = bank.readUInt8(objectOffset);
      const size = bank.readUInt32LE(objectOffset + 1);
      if (MUSIC_OBJECT_TYPES.has(type))
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
