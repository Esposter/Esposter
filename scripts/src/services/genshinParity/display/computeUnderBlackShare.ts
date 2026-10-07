import { BYTE } from "#src/services/shared/constants";
import { toneMapGenshin } from "genshin-engine";
import { Color } from "three";

// The darkest channel the tone curve shows, its black encoded for the screen as a byte
const { r: curveBlack } = new Color(...toneMapGenshin([0, 0, 0])).convertLinearToSRGB();
const BLACK_BYTE = Math.round(curveBlack * BYTE);
// The share of a raw RGB frame's pixels holding a channel darker than the tone curve shows anything, which no light
// Our scene solves can draw, so a solve weighed as the screen shows them is led by what it cannot reach. A pixel black
// In every channel is a letterbox's and is left out
export const computeUnderBlackShare = (data: Buffer): { blackByte: number; share: number } => {
  let [under, counted] = [0, 0];
  for (let offset = 0; offset < data.length; offset += 3) {
    const channels = [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0];
    if (Math.max(...channels) === 0) continue;
    counted++;
    if (Math.min(...channels) < BLACK_BYTE) under++;
  }
  return { blackByte: BLACK_BYTE, share: under / Math.max(counted, 1) };
};
