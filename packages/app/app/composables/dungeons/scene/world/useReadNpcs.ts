import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { Position } from "grid-engine";

import { NpcObjectProperty } from "#shared/generated/tiled/propertyTypes/class/NpcObjectProperty";
import { NpcPathObjectProperty } from "#shared/generated/tiled/propertyTypes/class/NpcPathObjectProperty";
import { ObjectType } from "#shared/generated/tiled/propertyTypes/class/ObjectType";
import { AssetKey } from "#shared/models/dungeons/keys/AssetKey";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import { Npc } from "@/models/dungeons/scene/world/Npc";
import { getNpc } from "@/services/dungeons/npc/getNpc";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { NotFoundError } from "@esposter/shared";
import { Direction } from "grid-engine";

export const useReadNpcs = () => {
  const npcStore = useNpcStore();
  const { initializeCursorPaginationData } = npcStore;
  const npcs: Npc[] = [];
  const worldSceneStore = useWorldSceneStore();
  const { objectLayerMap, tilemap } = storeToRefs(worldSceneStore);
  if (!objectLayerMap.value) throw new NotFoundError(useReadNpcs.name, ObjectType.Npc);

  for (const [layerName, npcLayer] of objectLayerMap.value.entries()) {
    if (!(layerName.includes(ObjectType.Npc) && npcLayer)) continue;

    const npcLayerObjects = getObjects(tilemap.value, npcLayer);
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
    npcs.push(
      new Npc({
        asset: { frame, key: AssetKey.Npc },
        id: `${CharacterId.Npc}${id}`,
        name: id,
        path: npcPath,
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
      }),
    );
  }

  initializeCursorPaginationData({ hasMore: false, items: npcs });
};
