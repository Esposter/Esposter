import type { SimilarityTermMap } from "#src/models/genshinParity/witness/SimilarityTermMap";

import { SURFACES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { drawPixels } from "#src/services/genshinParity/shared/drawPixels";
import { writeSideBySide } from "#src/services/genshinParity/shared/writeSideBySide";
import { toByte } from "#src/services/shared/toByte";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// The structure lost, one less its term, the diff draws at full red, half a term; past it a pixel whitens until its
// Two images are nothing alike
const LOST_FULL = 0.5;
// Where the surface pass's structure is lost on the frame, outside the repository: a panel per scale of its terms
// (`scoreLabelSimilarity`), finest first, each drawn at the frame's size, black where it holds and over the pixels no
// Family both draw. A loss at the finest panel only is detail off; at every panel, the layout under it. Returns the
// Image's path
export const writeStructureDiff = async (
  referenceId: string,
  termMaps: readonly SimilarityTermMap[],
  { height, width }: { height: number; width: number },
): Promise<string> => {
  const [finest] = termMaps;
  const panels = await Promise.all(
    termMaps.map(({ height: levelHeight, terms, width: levelWidth }, scale) =>
      drawPixels({ height, width }, (pixel) => {
        if (Number.isNaN(finest?.terms[pixel] ?? Number.NaN)) return [0, 0, 0];
        const column = Math.min(Math.floor((pixel % width) / 2 ** scale), levelWidth - 1);
        const row = Math.min(Math.floor(Math.floor(pixel / width) / 2 ** scale), levelHeight - 1);
        const share = (1 - (terms[row * levelWidth + column] ?? 1)) / LOST_FULL;
        return [toByte(share), toByte(share - 1), toByte(share - 1)];
      }),
    ),
  );
  await mkdir(SURFACES_DIRECTORY, { recursive: true });
  const path = join(SURFACES_DIRECTORY, `${referenceId}-structure.png`);
  await writeSideBySide(panels, { height, width }, path);
  return path;
};
