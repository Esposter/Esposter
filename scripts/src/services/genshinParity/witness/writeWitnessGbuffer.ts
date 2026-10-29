import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";

import { GBUFFER_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { writeSideBySide } from "#src/services/genshinParity/shared/writeSideBySide";
import { getColor } from "#src/services/genshinParity/witness/getColor";
import { getFamilyColor } from "#src/services/genshinParity/witness/getFamilyColor";
import { drawPixels } from "#src/services/recreation/image/drawPixels";
import { toByte } from "#src/services/shared/toByte";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A depth this many metres off reads half as bright in its preview, so the near parts and the far towers both show
const DEPTH_PREVIEW_HALF = 100;
// One reference's witness G-buffer in the parity folder, outside the repository: each target as its raw floats, a
// Header naming each part by its identifier, and a preview to check them by, the colour shot beside the parts coloured
// By family, the normals and the depth. Returns the preview's path
export const writeWitnessGbuffer = async (
  referenceId: string,
  gbuffer: WitnessGbuffer,
  shot: Buffer,
): Promise<string> => {
  const { albedo, depth, families, height, normal, part, parts, width } = gbuffer;
  const directory = join(GBUFFER_DIRECTORY, referenceId);
  await mkdir(directory, { recursive: true });
  await Promise.all([
    ...Object.entries({ albedo, depth, normal, part }).map(([target, values]) =>
      writeFile(join(directory, `${target}.f32`), Buffer.from(values.buffer, values.byteOffset, values.byteLength)),
    ),
    writeFile(join(directory, "header.json"), JSON.stringify({ families, height, parts, width }, null, 2)),
  ]);
  const panels = await Promise.all([
    sharp(shot).resize(width, height).removeAlpha().png().toBuffer(),
    drawPixels({ height, width }, (pixel) => {
      if (part[pixel * 4]) return getFamilyColor(part[pixel * 4 + 1] ?? 0);
      else return [0, 0, 0];
    }),
    drawPixels({ height, width }, (pixel) => getColor(normal, pixel, (value) => value * 0.5 + 0.5)),
    drawPixels({ height, width }, (pixel) => {
      const distance = depth[pixel * 4] ?? 0;
      const shade = toByte(distance > 0 ? DEPTH_PREVIEW_HALF / (DEPTH_PREVIEW_HALF + distance) : 0);
      return [shade, shade, shade];
    }),
    drawPixels({ height, width }, (pixel) => getColor(albedo, pixel, (value) => value)),
  ]);
  const previewPath = join(directory, "preview.png");
  await writeSideBySide(panels, { height, width }, previewPath);
  return previewPath;
};
