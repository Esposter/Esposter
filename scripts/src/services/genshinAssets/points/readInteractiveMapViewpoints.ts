import type { InteractiveMapPointInfo } from "#src/models/genshinAssets/points/InteractiveMapPointInfo";

import { INTERACTIVE_MAP_VIEWPOINTS_PATH } from "#src/services/genshinAssets/points/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// Every viewpoint point of the official map with the text written on it, as `genshin:assets points` read their infos into
// The references folder
export const readInteractiveMapViewpoints = async (): Promise<InteractiveMapPointInfo[]> =>
  parseMachineJson<InteractiveMapPointInfo[]>(await readFile(INTERACTIVE_MAP_VIEWPOINTS_PATH, "utf8"));
