import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { Position } from "grid-engine";

import { NpcObjectProperty } from "@/generated/tiled/propertyTypes/class/NpcObjectProperty";
import { NpcPathObjectProperty } from "@/generated/tiled/propertyTypes/class/NpcPathObjectProperty";
import { ObjectType } from "@/generated/tiled/propertyTypes/class/ObjectType";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { getNpc } from "@/services/dungeons/npc/getNpc";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { createItemMetadata } from "@/services/shared/createItemMetadata";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";

export const useReadNpcList = () => {
  const npcStore = useNpcStore();
  const { initializeCursorPaginationData } = npcStore;
  const npcList: Npc[] = [];

  for (const [layerName, npcLayer] of ExternalWorldSceneStore.objectLayerMap.entries()) {
    if (!(layerName.includes(ObjectType.Npc) && npcLayer)) continue;

    const npcLayerObjects = getObjects(npcLayer);
    const npcObject = npcLayerObjects.find((obj) => obj.type === ObjectType.Npc);
    if (!npcObject) continue;

    const npcPathObjects = npcLayerObjects.filter((obj) => obj.type === ObjectType.NpcPath);
    const npcPath: Record<number, Position> = {
      0: { x: npcObject.x, y: npcObject.y },
    };

    for (const { properties, x, y } of npcPathObjects) {
      const indexTiledObjectProperty = getTiledObjectProperty<number>(properties, NpcPathObjectProperty.index);
      npcPath[indexTiledObjectProperty.value] = { x, y };
    }

    const idTiledObjectProperty = getTiledObjectProperty<NpcId>(npcObject.properties, NpcObjectProperty.id);
    const { frame, id, ...rest } = getNpc(idTiledObjectProperty.value);
    npcList.push({
      asset: { frame, key: AssetKey.Npc },
      id: `${CharacterId.Npc}${id}`,
      isMoving: false,
      name: id,
      path: npcPath,
      pathIndex: 0,
      singleSidedSpritesheetDirection: Direction.RIGHT,
      walkingAnimationMapping: {
        down: {
          leftFoot: frame + 4,
          rightFoot: frame + 5,
          standing: frame,
        },
        left: {
          leftFoot: frame + 8,
          rightFoot: frame + 9,
          standing: frame + 2,
        },
        right: {
          leftFoot: frame + 8,
          rightFoot: frame + 9,
          standing: frame + 2,
        },
        up: {
          leftFoot: frame + 6,
          rightFoot: frame + 7,
          standing: frame + 1,
        },
      },
      ...rest,
      ...createItemMetadata(),
    });
  }

  initializeCursorPaginationData({ hasMore: false, items: npcList });
};
