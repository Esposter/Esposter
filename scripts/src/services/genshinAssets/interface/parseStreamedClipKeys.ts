import type { StreamedKey } from "#src/models/genshinAssets/interface/StreamedKey";

import { getOrCreate } from "@esposter/shared";

const FLOATS_PER_KEY = 5;
// A streamed clip's keys by the curve each drives, read off its exported words (`StreamedKey`)
export const parseStreamedClipKeys = (words: readonly number[]): Map<number, StreamedKey[]> => {
  const view = new DataView(Uint32Array.from(words).buffer);
  const getFloat = (index: number): number => view.getFloat32(index * 4, true);
  const getWord = (index: number): number => view.getUint32(index * 4, true);
  const curveKeysMap = new Map<number, StreamedKey[]>();
  let index = 0;
  while (index + 1 < words.length) {
    const time = getFloat(index);
    const keyCount = getWord(index + 1);
    index += 2;
    for (let key = 0; key < keyCount && index + FLOATS_PER_KEY <= words.length; key++) {
      const curve = getWord(index);
      const coefficients: StreamedKey["coefficients"] = [
        getFloat(index + 1),
        getFloat(index + 2),
        getFloat(index + 3),
        getFloat(index + 4),
      ];
      getOrCreate(curveKeysMap, curve, () => []).push({ coefficients, time });
      index += FLOATS_PER_KEY;
    }
  }
  return curveKeysMap;
};
