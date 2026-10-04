// Khronos' PBR Neutral tone mapping, which the renderer ends on: its toe offset, where it starts compressing a peak,
// And how far a compressed colour desaturates toward white
const TOE_END = 0.08;
const TOE_OFFSET = 0.04;
const COMPRESSION_START = 0.8 - TOE_OFFSET;
const DESATURATION = 0.15;
// A channel carried under a peak compressed to its new peak, and desaturated toward white by its share
const compressChannel = (channel: number, peak: number, newPeak: number, whiteShare: number): number =>
  (channel * newPeak) / peak + (newPeak - (channel * newPeak) / peak) * whiteShare;
// A scene colour in linear channels as the renderer's tone mapping shows it, before the display's encoding. Written
// Into the tuple given, so a caller that runs it every frame allocates nothing
export const toneMapNeutral = (
  [red, green, blue]: readonly [number, number, number],
  toneMapped: [number, number, number] = [0, 0, 0],
): [number, number, number] => {
  const lowest = Math.min(red, green, blue);
  const offset = lowest < TOE_END ? lowest - 6.25 * lowest * lowest : TOE_OFFSET;
  const offsetRed = red - offset;
  const offsetGreen = green - offset;
  const offsetBlue = blue - offset;
  const peak = Math.max(offsetRed, offsetGreen, offsetBlue);
  if (peak < COMPRESSION_START) {
    toneMapped[0] = offsetRed;
    toneMapped[1] = offsetGreen;
    toneMapped[2] = offsetBlue;
    return toneMapped;
  }
  const headroom = 1 - COMPRESSION_START;
  const newPeak = 1 - (headroom * headroom) / (peak + headroom - COMPRESSION_START);
  const whiteShare = 1 - 1 / (DESATURATION * (peak - newPeak) + 1);
  toneMapped[0] = compressChannel(offsetRed, peak, newPeak, whiteShare);
  toneMapped[1] = compressChannel(offsetGreen, peak, newPeak, whiteShare);
  toneMapped[2] = compressChannel(offsetBlue, peak, newPeak, whiteShare);
  return toneMapped;
};
