import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { InteractiveMapPointInfo } from "#src/models/genshinAssets/points/InteractiveMapPointInfo";

import {
  INTERACTIVE_MAP_INFO_BATCH_SIZE,
  INTERACTIVE_MAP_VIEWPOINT_LABEL_ID,
} from "#src/services/genshinAssets/points/constants";
import { fetchInteractiveMapData } from "#src/services/genshinAssets/points/fetchInteractiveMapData";
import { chunk } from "@esposter/shared";

// Each viewpoint point's info, the batches one after another so the map is not asked for them all at once
export const fetchViewpointInfos = (points: InteractiveMapPoint[]): Promise<InteractiveMapPointInfo[]> =>
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
