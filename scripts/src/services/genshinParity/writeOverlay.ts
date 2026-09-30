import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";

import { computeDistanceTransform } from "#src/services/genshinParity/computeDistanceTransform";
import { FAMILY_COLORS, GBUFFER_DIRECTORY } from "#src/services/genshinParity/constants";
import { findPartBoundaries } from "#src/services/genshinParity/findPartBoundaries";
import { readStructureEdges } from "#src/services/genshinParity/readStructureEdges";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// A reference's edges this many pixels or more from any witness boundary are drawn at the distance map's reddest
const FAR_EDGE_DISTANCE = 12;
// The witness's part boundaries drawn over the reference, each in its family's colour, beside a map of the reference's
// Edges coloured by how far each sits from the nearest boundary (green on one, red far off), so a part that does not
// Land shows where; and how far each family's boundaries sit from the reference's nearest edge, in pixels at the
// Structure's width, their mean over each family's boundary pixels. Returns the image's path with those distances
export const writeOverlay = async (
  referenceId: string,
  { gbuffer, image }: { gbuffer: WitnessGbuffer; image: Buffer },
): Promise<{ families: { distance: number; name: string; pixelCount: number }[]; path: string }> => {
  const { families: familyNames, height, width } = gbuffer;
  const { familyIndices, mask } = findPartBoundaries(gbuffer);
  const referenceEdges = await readStructureEdges(image, height);
  const edgeDistances = computeDistanceTransform(referenceEdges, width, height);
  const boundaryDistances = computeDistanceTransform(mask, width, height);
  const { data } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const overlay = Buffer.from(data);
  const edgeMap = Buffer.alloc(width * height * 3);
  const familySums = familyNames.map(() => ({ count: 0, sum: 0 }));
  for (let pixel = 0; pixel < width * height; pixel++) {
    const familyIndex = familyIndices[pixel] ?? -1;
    if (mask[pixel]) {
      overlay.set(FAMILY_COLORS[Math.max(familyIndex, 0) % FAMILY_COLORS.length] ?? [255, 255, 255], pixel * 3);
      const familySum = familySums[familyIndex];
      if (familySum) {
        familySum.count++;
        familySum.sum += edgeDistances[pixel] ?? 0;
      }
    }
    if (referenceEdges[pixel]) {
      const share = Math.min((boundaryDistances[pixel] ?? 0) / FAR_EDGE_DISTANCE, 1);
      edgeMap.set([Math.round(255 * share), Math.round(255 * (1 - share)), 0], pixel * 3);
    }
  }
  const directory = join(GBUFFER_DIRECTORY, referenceId);
  await mkdir(directory, { recursive: true });
  const path = join(directory, "overlay.png");
  const panels = await Promise.all(
    [overlay, edgeMap].map((pixels) =>
      sharp(pixels, { raw: { channels: 3, height, width } })
        .png()
        .toBuffer(),
    ),
  );
  await sharp({ create: { background: "#000", channels: 3, height, width: width * 2 } })
    .composite(panels.map((input, index) => ({ input, left: index * width, top: 0 })))
    .png()
    .toFile(path);
  return {
    families: familyNames.map((name, index) => {
      const { count, sum } = familySums[index] ?? { count: 0, sum: 0 };
      return { distance: count ? sum / count : 0, name: name || "unnamed", pixelCount: count };
    }),
    path,
  };
};
