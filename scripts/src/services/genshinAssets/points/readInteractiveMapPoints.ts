import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";

import { INTERACTIVE_MAP_POINTS_PATH } from "#src/services/genshinAssets/points/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// Every point of the official map as its point list was read into the references folder
export const readInteractiveMapPoints = async (): Promise<InteractiveMapPoint[]> => {
  const { point_list } = parseMachineJson<{ point_list: InteractiveMapPoint[] }>(
    await readFile(INTERACTIVE_MAP_POINTS_PATH, "utf8"),
  );
  return point_list;
};
