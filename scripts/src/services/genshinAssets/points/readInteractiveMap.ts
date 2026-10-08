import type { InteractiveMapResponse } from "#src/models/genshinAssets/points/InteractiveMapResponse";

import {
  INTERACTIVE_MAP_API_URL,
  INTERACTIVE_MAP_APP_SN,
  INTERACTIVE_MAP_DIRECTORY,
  INTERACTIVE_MAP_ID,
  INTERACTIVE_MAP_LANGUAGE,
  INTERACTIVE_MAP_POINTS_PATH,
  INTERACTIVE_MAP_TREE_PATH,
} from "#src/services/genshinAssets/points/constants";
import { fetchJson } from "#src/services/shared/fetchJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";

// One of the map's endpoints, answered in the envelope every endpoint shares, its data the answer itself
const fetchInteractiveMapData = async <TData>(endpoint: string): Promise<TData> => {
  const query = new URLSearchParams({
    app_sn: INTERACTIVE_MAP_APP_SN,
    lang: INTERACTIVE_MAP_LANGUAGE,
    map_id: String(INTERACTIVE_MAP_ID),
  });
  const url = `${INTERACTIVE_MAP_API_URL}/${endpoint}?${query}`;
  const { data, message, retcode } = await fetchJson<InteractiveMapResponse<TData>>(url);
  if (retcode !== 0) throw new InvalidOperationError(Operation.Read, url, message);
  return data;
};

// Reads the official map's label tree and its point list into the references folder, each as the API gives it, and
// Returns the two paths it wrote
export const readInteractiveMap = async (): Promise<string[]> => {
  const [tree, points] = await Promise.all([
    fetchInteractiveMapData<unknown>("label/tree"),
    fetchInteractiveMapData<unknown>("point/list"),
  ]);
  await mkdir(INTERACTIVE_MAP_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(INTERACTIVE_MAP_TREE_PATH, JSON.stringify(tree)),
    writeFile(INTERACTIVE_MAP_POINTS_PATH, JSON.stringify(points)),
  ]);
  return [INTERACTIVE_MAP_TREE_PATH, INTERACTIVE_MAP_POINTS_PATH];
};
