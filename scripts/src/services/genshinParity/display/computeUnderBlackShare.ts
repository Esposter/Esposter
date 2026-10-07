import type { Vector } from "#src/models/shared/Vector";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { BYTE } from "#src/services/shared/constants";
import { toneMapGenshin } from "genshin-engine";
import { Color } from "three";

// The tone curve's black at none, encoded for the screen as a byte
const { r: curveBlack } = new Color(...toneMapGenshin([0, 0, 0])).convertLinearToSRGB();
const BLACK_BYTE = Math.round(curveBlack * BYTE);
// The share of a raw RGB frame's pixels holding a channel darker than the tone curve shows a scene colour of none, and
// Each channel's own share, which tells a matrix before the curve taking one channel of a saturated colour under none
// (the night's red, while its green stands at the black) from a gamma or an encoding darkening every channel alike. A
// Pixel black in every channel is a letterbox's and is left out
export const computeUnderBlackShare = (data: Buffer): { blackByte: number; channelShares: Vector; share: number } => {
  const channelCounts: Vector = [0, 0, 0];
  let [under, counted] = [0, 0];
  for (let offset = 0; offset < data.length; offset += 3) {
    const channels = [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0];
    if (Math.max(...channels) === 0) continue;
    counted++;
    if (Math.min(...channels) < BLACK_BYTE) under++;
    for (const channel of CHANNELS)
      if ((channels[channel] ?? 0) < BLACK_BYTE) channelCounts[channel] = (channelCounts[channel] ?? 0) + 1;
  }
  const total = Math.max(counted, 1);
  return {
    blackByte: BLACK_BYTE,
    channelShares: channelCounts.map((count) => count / total) as Vector,
    share: under / total,
  };
};
