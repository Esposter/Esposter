// A streamed clip's keys by curve: its data is a run of frames, each a float time and a key count, then per key a curve
// Index and four cubic coefficients, the segment from that key's time on being ((a·t + b)·t + c)·t + d in the time
// Since it. The data is exported as 32-bit words, so a float is read back from its word's bits
export interface StreamedKey {
  coefficients: [number, number, number, number];
  time: number;
}
const FLOATS_PER_KEY = 5;

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
      const keys = curveKeysMap.get(curve);
      if (keys) keys.push({ coefficients, time });
      else curveKeysMap.set(curve, [{ coefficients, time }]);
      index += FLOATS_PER_KEY;
    }
  }
  return curveKeysMap;
};
