import type { ExcelViewCodexRow } from "#src/models/genshinAssets/archive/ExcelViewCodexRow";
import type { SceneGroupMember } from "genshin-world";

import { VIEW_CODEX_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { GROUND_LAYER } from "#src/services/genshinAssets/points/constants";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readInteractiveMapViewpoints } from "#src/services/genshinAssets/points/readInteractiveMapViewpoints";
import { matchViewpointPoints } from "#src/services/genshinAssets/sceneGroups/matchViewpointPoints";
import { OPEN_WORLD_SCENE_ID } from "#src/services/genshinAssets/shared/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";
import { SceneGroupMemberKind, SceneGroupSource } from "genshin-world";

// Each viewpoint the codex lists in the open world, as a gadget of the group its row names, by group id. Its place is
// The official map's viewpoint point its English name is matched to, carried into the game's axes by the map's fit. A
// Viewpoint matched to no one point, or to one on a layer under the ground, is left with no place
export const readViewpointMembers = async (): Promise<[number, SceneGroupMember][]> => {
  const [infos, { transform }] = await Promise.all([readInteractiveMapViewpoints(), readFittedMapPoints()]);
  const englishText = readTextMap(GameLanguage.English);
  const rows = readExcelTable<ExcelViewCodexRow>(VIEW_CODEX_TABLE_NAME).filter(
    ({ isDisuse, sceneId }) => !isDisuse && sceneId === OPEN_WORLD_SCENE_ID,
  );
  const viewpointPointIdMap = matchViewpointPoints(
    new Map(rows.map(({ id, nameTextMapHash }) => [id, englishText.get(String(nameTextMapHash)) ?? ""])),
    new Map(infos.map(({ content, id }) => [id, content])),
  );
  const infoMap = new Map(infos.map((info) => [info.id, info]));
  return rows.map(({ configId, gadgetId, groupId, id }): [number, SceneGroupMember] => {
    const pointId = viewpointPointIdMap.get(id);
    const info = pointId === undefined ? undefined : infoMap.get(pointId);
    const member: SceneGroupMember = {
      configId,
      kind: SceneGroupMemberKind.Gadget,
      objectId: gadgetId,
      source: SceneGroupSource.ViewCodex,
    };
    if (info?.z_level !== GROUND_LAYER) return [groupId, member];
    const position = applySimilarityTransform(transform, { x: info.x_pos, z: info.y_pos });
    return [
      groupId,
      {
        ...member,
        place: {
          position: { x: roundFitted(position.x), z: roundFitted(position.z) },
          source: SceneGroupSource.OfficialMap,
        },
      },
    ];
  });
};
