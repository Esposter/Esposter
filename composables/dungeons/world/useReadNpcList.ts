import { NpcObjectProperty } from "@/generated/tiled/propertyTypes/class/NpcObjectProperty";
import { NpcPathObjectProperty } from "@/generated/tiled/propertyTypes/class/NpcPathObjectProperty";
import { ObjectType } from "@/generated/tiled/propertyTypes/class/ObjectType";
import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import { getNpc } from "@/services/dungeons/npc/getNpc";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { createItemMetadata } from "@/services/shared/createItemMetadata";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";
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

    for (const { x, y, properties } of npcPathObjects) {
      const indexTiledObjectProperty = getTiledObjectProperty<number>(properties, NpcPathObjectProperty.index);
      npcPath[indexTiledObjectProperty.value] = { x, y };
    }

    const idTiledObjectProperty = getTiledObjectProperty<NpcId>(npcObject.properties, NpcObjectProperty.id);
    const { id, frame, ...rest } = getNpc(idTiledObjectProperty.value);
    npcList.push({
      id: `${CharacterId.Npc}${npcObject.name}`,
      name: npcObject.name,
      asset: { key: AssetKey.Npc, frame },
      walkingAnimationMapping: {
        up: {
          leftFoot: frame + 6,
          standing: frame + 1,
          rightFoot: frame + 7,
        },
        down: {
          leftFoot: frame + 4,
          standing: frame,
          rightFoot: frame + 5,
        },
        left: {
          leftFoot: frame + 8,
          standing: frame + 2,
          rightFoot: frame + 9,
        },
        right: {
          leftFoot: frame + 8,
          standing: frame + 2,
          rightFoot: frame + 9,
        },
      },
      singleSidedSpritesheetDirection: Direction.RIGHT,
      path: npcPath,
      pathIndex: 0,
      isMoving: false,
      ...rest,
      ...createItemMetadata(),
    });
  }

  initializeCursorPaginationData({ items: npcList, hasMore: false, nextCursor: null });
};
