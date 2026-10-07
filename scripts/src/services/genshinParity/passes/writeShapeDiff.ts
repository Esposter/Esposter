import { computeNormalAngle } from "#src/services/genshinParity/passes/computeNormalAngle";
import { SHAPE_NORMAL_GATE_DEGREES } from "#src/services/genshinParity/passes/constants";
import { readTargetFamily } from "#src/services/genshinParity/passes/readTargetFamily";
import { SHAPES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { drawPixels } from "#src/services/genshinParity/shared/drawPixels";
import { writeSideBySide } from "#src/services/genshinParity/shared/writeSideBySide";
import { BYTE } from "#src/services/shared/constants";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// The normals' angle the diff draws at full red, a few times the gate, so a facet just past it still reads orange
const ANGLE_FULL_DEGREES = SHAPE_NORMAL_GATE_DEGREES * 4;
const toByte = (share: number): number => Math.round(Math.min(Math.max(share, 0), 1) * BYTE);
// Where the shape pass's readings lie on the frame, outside the repository: the exports' normals, ours, and a diff
// Coloured green to red by the normals' angle where both draw one family, white where only the exports draw a part and
// Blue where only ours does. Returns the image's path
export const writeShapeDiff = async (
  referenceId: string,
  exportsTargets: { normal: Float32Array; part: Float32Array },
  oursTargets: { normal: Float32Array; part: Float32Array },
  { height, width }: { height: number; width: number },
): Promise<string> => {
  const toNormalImage = ({ normal, part }: { normal: Float32Array; part: Float32Array }): Promise<Buffer> =>
    drawPixels({ height, width }, (pixel) => {
      if (readTargetFamily(part, pixel) < 0) return [0, 0, 0];
      const toChannel = (axis: number): number => toByte((normal[pixel * 4 + axis] ?? 0) * 0.5 + 0.5);
      return [toChannel(0), toChannel(1), toChannel(2)];
    });
  const panels = await Promise.all([
    toNormalImage(exportsTargets),
    toNormalImage(oursTargets),
    drawPixels({ height, width }, (pixel) => {
      const exportsFamily = readTargetFamily(exportsTargets.part, pixel);
      const oursFamily = readTargetFamily(oursTargets.part, pixel);
      if (exportsFamily !== oursFamily) return exportsFamily < 0 ? [0, 96, BYTE] : [BYTE, BYTE, BYTE];
      else if (exportsFamily < 0) return [0, 0, 0];
      const share = computeNormalAngle(exportsTargets.normal, oursTargets.normal, pixel) / ANGLE_FULL_DEGREES;
      return [toByte(share * 2), toByte(2 - share * 2), 0];
    }),
  ]);
  await mkdir(SHAPES_DIRECTORY, { recursive: true });
  const path = join(SHAPES_DIRECTORY, `${referenceId}.png`);
  await writeSideBySide(panels, { height, width }, path);
  return path;
};
