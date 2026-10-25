import {
  TEXT_MAP_COUNT_ADDEND,
  TEXT_MAP_COUNT_XOR,
  TEXT_MAP_KEY_FINISH,
  TEXT_MAP_LENGTH_FINISH,
  TEXT_MAP_MAX_COUNT,
} from "#src/services/genshinText/constants";
import { getHighHalfWord } from "#src/services/genshinText/getHighHalfWord";
import { getHighWord } from "#src/services/genshinText/getHighWord";
import { getLowHalfWord } from "#src/services/genshinText/getLowHalfWord";
import { getLowWord } from "#src/services/genshinText/getLowWord";
import { mix64 } from "#src/services/genshinText/mix64";
import { InvalidOperationError, Operation } from "@esposter/shared";

const WORD_BYTES = 8;
const REPLACEMENT_CHARACTER = "�";

// Decodes one text map chunk, the payload past its length prefix, into its strings by hash. A chunk is an entry count,
// Then each entry's key and length and a body padded to eight bytes, and it is refused unless it is consumed exactly.
// Ported from owomocha's genshin-7.0-local-re-devkit (MIT, `src/genshin_re/textmap.py`), whose constants are for 7.0.0
export const decodeTextMap = (chunk: Uint8Array): Map<string, string> => {
  if (chunk.byteLength < 4) throw new InvalidOperationError(Operation.Read, "text map", "is too short for its count");
  const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  const count = (((view.getUint32(0, true) + TEXT_MAP_COUNT_ADDEND) >>> 0) ^ TEXT_MAP_COUNT_XOR) >>> 0;
  if (count > TEXT_MAP_MAX_COUNT)
    throw new InvalidOperationError(Operation.Read, "text map", `has an implausible ${count} entries`);

  const textMap = new Map<string, string>();
  let position = 4;
  for (let index = 0; index < count; index++) {
    if (position + 6 > chunk.byteLength)
      throw new InvalidOperationError(Operation.Read, "text map", `is truncated at entry ${index}`);
    const keyMix = mix64(BigInt(index), TEXT_MAP_KEY_FINISH);
    const key = ((view.getUint32(position, true) ^ getLowWord(keyMix)) + getHighWord(keyMix)) >>> 0;
    position += 4;
    const lengthMix = mix64(BigInt((key + index) >>> 0), TEXT_MAP_LENGTH_FINISH);
    const length = ((view.getUint16(position, true) ^ getLowHalfWord(lengthMix)) + getHighHalfWord(lengthMix)) & 0xffff;
    position += 2;
    if (position + length > chunk.byteLength)
      throw new InvalidOperationError(Operation.Read, "text map", `is truncated in entry ${index}'s body`);

    const body = new Uint8Array(Math.ceil(length / WORD_BYTES) * WORD_BYTES);
    body.set(chunk.subarray(position, position + length));
    position += length;
    const bodyView = new DataView(body.buffer);
    for (let offset = 0; offset < body.byteLength; offset += WORD_BYTES)
      bodyView.setBigUint64(offset, BigInt.asUintN(64, bodyView.getBigUint64(offset, true) + lengthMix), true);
    const text = new TextDecoder().decode(body.subarray(0, length));
    if (text.includes(REPLACEMENT_CHARACTER))
      throw new InvalidOperationError(Operation.Read, "text map", `has entry ${index} that is not UTF-8`);
    textMap.set(String(key), text);
  }

  if (position !== chunk.byteLength)
    throw new InvalidOperationError(
      Operation.Read,
      "text map",
      `leaves ${chunk.byteLength - position} bytes past its ${count} entries`,
    );
  return textMap;
};
