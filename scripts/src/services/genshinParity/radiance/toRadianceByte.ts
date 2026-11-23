import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { toSceneColor } from "genshin-engine";
import { Color } from "three";

// The scene radiance each byte of a display channel stands for, as the renderer's tone curve shows it: the byte decoded
// From sRGB, then the curve's closed inverse (`toSceneColor`). The curve acts on each channel alone, so one table reads
// Every channel of a frame, and a byte the curve's white clips reads its brightest radiance, which `tallyRadiance`
// Drops
const RADIANCE_BYTES = Float64Array.from({ length: BYTE + 1 }, (_value, byte) => {
  const linear = toLinear(byte / BYTE);
  return toSceneColor(new Color(linear, linear, linear)).r;
});

// The scene radiance a display byte stands for, from the table above
export const toRadianceByte = (byte: number): number => RADIANCE_BYTES[byte] ?? 0;
