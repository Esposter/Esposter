import type { InteractiveMapFitFile } from "#src/models/genshinAssets/points/InteractiveMapFitFile";
import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";

import { INTERACTIVE_MAP_FIT_PATH } from "#src/services/genshinAssets/points/constants";
import { readInteractiveMapPoints } from "#src/services/genshinAssets/points/readInteractiveMapPoints";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// The official map's points with the transform the fit solved over them. The fit must have run, since it writes the transform
export const readFittedMapPoints = async (): Promise<{
  points: InteractiveMapPoint[];
  transform: SimilarityTransform;
}> => {
  const [points, fitContent] = await Promise.all([
    readInteractiveMapPoints(),
    readFile(INTERACTIVE_MAP_FIT_PATH, "utf8"),
  ]);
  const { transform } = parseMachineJson<InteractiveMapFitFile>(fitContent);
  return { points, transform };
};
