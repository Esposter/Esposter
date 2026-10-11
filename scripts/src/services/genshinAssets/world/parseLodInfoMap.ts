import { getMonoBehaviourFieldsOffset } from "#src/services/genshinAssets/shared/getMonoBehaviourFieldsOffset";
import { LOD_INFO_MAP_NAME } from "#src/services/genshinAssets/world/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

const WORD = 4;
const PATH_HASH_BYTES = 8;
// A record's key, the prefab's world id in its low four bytes, then six words this does not read
const RECORD_HEAD_BYTES = PATH_HASH_BYTES + 6 * WORD;
// A level is its number, its prefab's 64-bit path hash and a word this does not read
const LEVEL_BYTES = WORD + PATH_HASH_BYTES + WORD;
// After the levels, two floats, the collider prefab's 64-bit path hash and two words
const RECORD_TAIL_BYTES = 2 * WORD + PATH_HASH_BYTES + 2 * WORD;
// The game's LOD table (`LODFinInfoMap`) out of its MonoBehaviour's raw export: past its name, a count, then per
// Prefab grouped by level of detail a record of its world id, a count and that many levels, each a prefab of its own
// (`_Lod0`, `_Lod1`, `_Lod9` the farthest) named by its path hash. A placement of such a prefab carries its world id
// And no path hash, so this names its finest level, the lowest number, by the path hash a placement would carry, and a
// Record with no level names none. Records that do not end where the bytes do are a layout this does not read, and throw
export const parseLodInfoMap = (bytes: Buffer): Map<number, string> => {
  const prefabIdPathHashMap = new Map<number, string>();
  const countOffset = getMonoBehaviourFieldsOffset(bytes);
  const count = bytes.readUInt32LE(countOffset);
  let cursor = countOffset + WORD;
  for (let record = 0; record < count; record++) {
    const prefabId = bytes.readUInt32LE(cursor);
    const levelCount = bytes.readUInt32LE(cursor + RECORD_HEAD_BYTES);
    const levelsOffset = cursor + RECORD_HEAD_BYTES + WORD;
    const levels = Array.from({ length: levelCount }, (_value, index) => {
      const levelOffset = levelsOffset + index * LEVEL_BYTES;
      return { level: bytes.readUInt32LE(levelOffset), pathHash: bytes.readBigUInt64LE(levelOffset + WORD) };
    });
    const [finest] = levels.toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level);
    if (finest) prefabIdPathHashMap.set(prefabId, String(finest.pathHash));
    cursor = levelsOffset + levelCount * LEVEL_BYTES + RECORD_TAIL_BYTES;
  }
  if (cursor !== bytes.length)
    throw new InvalidOperationError(
      Operation.Read,
      LOD_INFO_MAP_NAME,
      `${count} records end at byte ${cursor} of ${bytes.length}`,
    );
  return prefabIdPathHashMap;
};
