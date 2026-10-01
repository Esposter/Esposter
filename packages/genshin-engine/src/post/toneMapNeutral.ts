// Khronos' PBR Neutral tone mapping, which the renderer ends on: its toe offset, where it starts compressing a peak,
// And how far a compressed colour desaturates toward white
const TOE_END = 0.08;
const TOE_OFFSET = 0.04;
const COMPRESSION_START = 0.8 - TOE_OFFSET;
const DESATURATION = 0.15;
// A scene colour in linear channels as the renderer's tone mapping shows it, before the display's encoding
export const toneMapNeutral = ([red, green, blue]: [number, number, number]): [number, number, number] => {
  const lowest = Math.min(red, green, blue);
  const offset = lowest < TOE_END ? lowest - 6.25 * lowest * lowest : TOE_OFFSET;
  const offsetColor: [number, number, number] = [red - offset, green - offset, blue - offset];
  const peak = Math.max(...offsetColor);
  if (peak < COMPRESSION_START) return offsetColor;
  const headroom = 1 - COMPRESSION_START;
  const newPeak = 1 - (headroom * headroom) / (peak + headroom - COMPRESSION_START);
  const whiteShare = 1 - 1 / (DESATURATION * (peak - newPeak) + 1);
  return offsetColor.map(
    (channel) => (channel * newPeak) / peak + (newPeak - (channel * newPeak) / peak) * whiteShare,
  ) as [number, number, number];
};
