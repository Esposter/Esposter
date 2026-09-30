import { Color } from "three";

// Khronos' PBR Neutral tone mapping, which the renderer ends on: its toe offset, where it starts compressing a peak,
// And how far a compressed colour desaturates toward white
const TOE_END = 0.08;
const TOE_OFFSET = 0.04;
const COMPRESSION_START = 0.8 - TOE_OFFSET;
const DESATURATION = 0.15;
// The inverse is found by Newton steps on each channel, its slope measured a small nudge away: the channels barely
// Pull on one another, so a handful of steps meet the measured colour well within the display's precision
const INVERSE_STEP_COUNT = 16;
const SLOPE_NUDGE = 1e-4;

const toneMap = ([red, green, blue]: [number, number, number]): [number, number, number] => {
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
// The scene colour the renderer's tone mapping shows as a colour measured off a reference, for a colour the screen
// Shows as it is (the sky, its haze, an unlit cloud): fed in unmapped, a measured colour comes out paler and greyer by
// The tone mapping's compression
export const toSceneColor = (displayColor: Color): Color => {
  const target: [number, number, number] = [displayColor.r, displayColor.g, displayColor.b];
  let input: [number, number, number] = [...target];
  for (let step = 0; step < INVERSE_STEP_COUNT; step++) {
    const current = input;
    const output = toneMap(current);
    input = current.map((channel, index) => {
      const nudged: [number, number, number] = [...current];
      nudged[index] = channel + SLOPE_NUDGE;
      const slope = ((toneMap(nudged)[index] ?? 0) - (output[index] ?? 0)) / SLOPE_NUDGE;
      return Math.max(channel + ((target[index] ?? 0) - (output[index] ?? 0)) / slope, 0);
    }) as [number, number, number];
  }
  return new Color(...input);
};
