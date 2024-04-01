import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import type { Npc } from "@/models/dungeons/world/Npc";
import type { NpcMovementPattern } from "@/models/dungeons/world/home/NpcMovementPattern";
import { NpcObjectProperty } from "@/models/dungeons/world/home/NpcObjectProperty";
import { ObjectLayer } from "@/models/dungeons/world/home/ObjectLayer";
import { ObjectType } from "@/models/dungeons/world/home/ObjectType";
import { MESSAGE_SEPARATOR } from "@/services/dungeons/constants";
import { findTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";
import { Direction } from "grid-engine";

export const useReadNpcList = () => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  const npcStore = useNpcStore();
  const { initializeCursorPaginationData } = npcStore;
  const npcLayerNames = tilemap.value.getObjectLayerNames().filter((layerName) => layerName.includes(ObjectLayer.Npc));
  const npcList: Npc[] = [];

  for (const npcLayerName of npcLayerNames) {
    const npcLayer = tilemap.value.getObjectLayer(npcLayerName);
    if (!npcLayer) continue;

    const npcObject = npcLayer.objects.find((obj) => obj.type === ObjectType.Npc);
    if (!(npcObject?.x && npcObject.y)) continue;

    const npcPathObjects = npcLayer.objects.filter((obj) => obj.type === ObjectType.NpcPath);
    const npcPath: Record<number, Position> = {
      0: useObjectUnitPosition({ x: npcObject.x, y: npcObject.y }),
    };

    for (const { name, x, y } of npcPathObjects) {
      if (!(x && y)) continue;
      npcPath[parseInt(name)] = useObjectUnitPosition({ x, y });
    }

    const frameTiledObjectProperty = findTiledObjectProperty<string>(npcObject.properties, NpcObjectProperty.frame);
    if (!frameTiledObjectProperty) continue;

    const messagesTiledObjectProperty = findTiledObjectProperty<string>(
      npcObject.properties,
      NpcObjectProperty.messages,
    );
    if (!messagesTiledObjectProperty) continue;

    const movementPatternTiledObjectProperty = findTiledObjectProperty<NpcMovementPattern>(
      npcObject.properties,
      NpcObjectProperty.movementPattern,
    );
    if (!movementPatternTiledObjectProperty) continue;

    const frame = parseInt(frameTiledObjectProperty.value);
    const messages = messagesTiledObjectProperty.value.split(MESSAGE_SEPARATOR);
    const movementPattern = movementPatternTiledObjectProperty.value;
    const createdAt = new Date();
    npcList.push({
      id: `${CharacterId.Npc}${npcObject.name}`,
      name: npcObject.name,
      asset: { key: SpritesheetKey.Npc, frame },
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
