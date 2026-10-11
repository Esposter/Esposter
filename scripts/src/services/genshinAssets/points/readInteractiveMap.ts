import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { InteractiveMapPointInfo } from "#src/models/genshinAssets/points/InteractiveMapPointInfo";
import type { InteractiveMapResponse } from "#src/models/genshinAssets/points/InteractiveMapResponse";

import {
  INTERACTIVE_MAP_API_URL,
  INTERACTIVE_MAP_APP_SN,
  INTERACTIVE_MAP_DIRECTORY,
  INTERACTIVE_MAP_ID,
  INTERACTIVE_MAP_INFO_BATCH_SIZE,
  INTERACTIVE_MAP_LANGUAGE,
  INTERACTIVE_MAP_POINTS_PATH,
  INTERACTIVE_MAP_TREE_PATH,
  INTERACTIVE_MAP_VIEWPOINT_LABEL_ID,
  INTERACTIVE_MAP_VIEWPOINTS_PATH,
} from "#src/services/genshinAssets/points/constants";
import { fetchJson } from "#src/services/shared/fetchJson";
import { chunk, InvalidOperationError, Operation } from "@esposter/shared";
import { mkdir, writeFile } from "node:fs/promises";

// One of the map's endpoints, answered in the envelope every endpoint shares, its data the answer itself
const fetchInteractiveMapData = async <TData>(
  endpoint: string,
  parameters: Record<string, string> = {},
): Promise<TData> => {
  const query = new URLSearchParams({
    ...parameters,
    app_sn: INTERACTIVE_MAP_APP_SN,
    lang: INTERACTIVE_MAP_LANGUAGE,
    map_id: String(INTERACTIVE_MAP_ID),
  });
  const url = `${INTERACTIVE_MAP_API_URL}/${endpoint}?${query}`;
  const { data, message, retcode } = await fetchJson<InteractiveMapResponse<TData>>(url);
  if (retcode !== 0) throw new InvalidOperationError(Operation.Read, url, message);
  return data;
};

// Each viewpoint point's info, the batches one after another so the map is not asked for them all at once
const fetchViewpointInfos = (points: InteractiveMapPoint[]): Promise<InteractiveMapPointInfo[]> =>
  chunk(
    points.filter(({ label_id }) => label_id === INTERACTIVE_MAP_VIEWPOINT_LABEL_ID),
    INTERACTIVE_MAP_INFO_BATCH_SIZE,
  ).reduce<Promise<InteractiveMapPointInfo[]>>(async (previousInfos, batch) => {
    const infos = await previousInfos;
    const batchInfos = await Promise.all(
      batch.map(
        async ({ id }) =>
          (await fetchInteractiveMapData<{ info: InteractiveMapPointInfo }>("point/info", { point_id: String(id) }))
            .info,
      ),
    );
    return [...infos, ...batchInfos];
  }, Promise.resolve([]));

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
