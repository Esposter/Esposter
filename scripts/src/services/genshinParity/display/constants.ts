import { BYTE } from "#src/services/shared/constants";
import { toneMapGenshin } from "genshin-engine";
import { Color } from "three";

// The tone curve's black at none, encoded for the screen as a byte: a channel shown under it is one the white balance
// Took under none before the curve
const { r: curveBlack } = new Color(...toneMapGenshin([0, 0, 0])).convertLinearToSRGB();
export const TONE_CURVE_BLACK_BYTE: number = Math.round(curveBlack * BYTE);
