import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";

import {
  INTERACTIVE_MAP_DIRECTORY,
  INTERACTIVE_MAP_POINTS_PATH,
  INTERACTIVE_MAP_TREE_PATH,
  INTERACTIVE_MAP_VIEWPOINTS_PATH,
} from "#src/services/genshinAssets/points/constants";
import { fetchInteractiveMapData } from "#src/services/genshinAssets/points/fetchInteractiveMapData";
import { fetchViewpointInfos } from "#src/services/genshinAssets/points/fetchViewpointInfos";
import { mkdir, writeFile } from "node:fs/promises";

// Reads the official map's label tree, its point list and its viewpoints' infos into the references folder, each as the
// API gives it, and returns the three paths it wrote
export const readInteractiveMap = async (): Promise<string[]> => {
  const [tree, points] = await Promise.all([
    fetchInteractiveMapData<unknown>("label/tree"),
    fetchInteractiveMapData<{ point_list: InteractiveMapPoint[] }>("point/list"),
  ]);
  const viewpointInfos = await fetchViewpointInfos(points.point_list);
  await mkdir(INTERACTIVE_MAP_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(INTERACTIVE_MAP_TREE_PATH, JSON.stringify(tree)),
    writeFile(INTERACTIVE_MAP_POINTS_PATH, JSON.stringify(points)),
    writeFile(INTERACTIVE_MAP_VIEWPOINTS_PATH, JSON.stringify(viewpointInfos)),
  ]);
  return [INTERACTIVE_MAP_TREE_PATH, INTERACTIVE_MAP_POINTS_PATH, INTERACTIVE_MAP_VIEWPOINTS_PATH];
};
