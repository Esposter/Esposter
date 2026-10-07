// A sky's mask dealt into two halves as a chequerboard of square blocks the size given, shifted by the offset across and
// Down, so each half holds sky from every part of the frame and the two differ only in which of its views they see
export const splitSkyMask = (
  sky: Uint8Array,
  width: number,
  blockSize: number,
  offset = 0,
): [Uint8Array, Uint8Array] => {
  const [first, second] = [new Uint8Array(sky.length), new Uint8Array(sky.length)];
  for (const [pixel, isSky] of sky.entries()) {
    if (!isSky) continue;
    const [column, row] = [pixel % width, Math.floor(pixel / width)];
    const isFirst = (Math.floor((column + offset) / blockSize) + Math.floor((row + offset) / blockSize)) % 2 === 0;
    (isFirst ? first : second)[pixel] = 1;
  }
  return [first, second];
};
