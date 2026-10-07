import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";
import { readTargetLightness } from "#src/services/genshinParity/passes/readTargetLightness";
import { SURFACES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { drawPixels } from "#src/services/genshinParity/shared/drawPixels";
import { writeSideBySide } from "#src/services/genshinParity/shared/writeSideBySide";
import { BYTE } from "#src/services/shared/constants";
import { toSrgb } from "#src/services/shared/toSrgb";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// The lightness apart, as a share, the diff draws at full strength: a fifth of the way from black to white
const LIGHTNESS_FULL = 0.2;
const toByte = (share: number): number => Math.round(Math.min(Math.max(share, 0), 1) * BYTE);
// Where the surface pass's readings lie on the frame, outside the repository: the exports' unlit colour, ours, and a
// Diff where both draw one family, red where ours is the lighter and blue where it is the darker, by their lightness
// (`readTargetLightness`). Returns the image's path
export const writeSurfaceDiff = async (
  referenceId: string,
  exportsTargets: { albedo: Float32Array; part: Float32Array },
  oursTargets: { albedo: Float32Array; part: Float32Array },
  { height, width }: { height: number; width: number },
): Promise<string> => {
  const toAlbedoImage = ({ albedo, part }: { albedo: Float32Array; part: Float32Array }): Promise<Buffer> =>
    drawPixels({ height, width }, (pixel) => {
      if (readTargetFamily(part, pixel) < 0) return [0, 0, 0];
      const toChannel = (channel: number): number => toByte(toSrgb(Math.min(albedo[pixel * 4 + channel] ?? 0, 1)));
      return [toChannel(0), toChannel(1), toChannel(2)];
    });
  const exportsLightness = readTargetLightness(exportsTargets.albedo);
  const oursLightness = readTargetLightness(oursTargets.albedo);
  const panels = await Promise.all([
    toAlbedoImage(exportsTargets),
    toAlbedoImage(oursTargets),
    drawPixels({ height, width }, (pixel) => {
      const family = readTargetFamily(exportsTargets.part, pixel);
      if (family < 0 || family !== readTargetFamily(oursTargets.part, pixel)) return [0, 0, 0];
      const share = ((oursLightness[pixel] ?? 0) - (exportsLightness[pixel] ?? 0)) / LIGHTNESS_FULL;
      return [toByte(share), 0, toByte(-share)];
    }),
  ]);
  await mkdir(SURFACES_DIRECTORY, { recursive: true });
  const path = join(SURFACES_DIRECTORY, `${referenceId}.png`);
  await writeSideBySide(panels, { height, width }, path);
  return path;
};
