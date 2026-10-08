import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

import { INTERACTIVE_MAP_TREE_PATH } from "#src/services/genshinAssets/points/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";

// The official map's label tree as its label tree was read into the references folder, its top-level labels the
// Categories the map files its marks in
export const readInteractiveMapLabels = async (): Promise<InteractiveMapLabel[]> => {
  const { tree } = parseMachineJson<{ tree: InteractiveMapLabel[] }>(await readFile(INTERACTIVE_MAP_TREE_PATH, "utf8"));
  return tree;
};
