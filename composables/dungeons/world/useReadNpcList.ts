import { NpcObjectProperty } from "@/generated/tiled/propertyTypes/class/NpcObjectProperty";
import { ObjectType } from "@/generated/tiled/propertyTypes/class/ObjectType";
import type { NpcMovementPattern } from "@/generated/tiled/propertyTypes/enum/NpcMovementPattern";
import { AssetKey } from "@/models/dungeons/keys/AssetKey";
import { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import { getObjects } from "@/services/dungeons/scene/world/getObjects";
import { MESSAGE_SEPARATOR } from "@/services/dungeons/tilemap/constants";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
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

    for (const { name, x, y } of npcPathObjects) npcPath[parseInt(name)] = { x, y };

    const frameTiledObjectProperty = getTiledObjectProperty<string>(npcObject.properties, NpcObjectProperty.frame);
    const messagesTiledObjectProperty = getTiledObjectProperty<string>(
      npcObject.properties,
      NpcObjectProperty.messages,
    );
    const movementPatternTiledObjectProperty = getTiledObjectProperty<NpcMovementPattern>(
      npcObject.properties,
      NpcObjectProperty.movementPattern,
    );
    const frame = parseInt(frameTiledObjectProperty.value);
    const messages = messagesTiledObjectProperty.value.split(MESSAGE_SEPARATOR);
    const movementPattern = movementPatternTiledObjectProperty.value;
    const createdAt = new Date();
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
      messages,
      path: npcPath,
      pathIndex: 0,
      movementPattern,
      isMoving: false,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    });
  }

  initializeCursorPaginationData({ items: npcList, hasMore: false, nextCursor: null });
};
