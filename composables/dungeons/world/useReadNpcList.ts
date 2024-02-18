import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { NpcObjectProperty } from "@/models/dungeons/world/home/NpcObjectProperty";
import { ObjectLayer } from "@/models/dungeons/world/home/ObjectLayer";
import { ObjectType } from "@/models/dungeons/world/home/ObjectType";
import { MESSAGE_SEPARATOR } from "@/services/dungeons/constants";
import { getObjectUnitPosition } from "@/services/dungeons/tilemap/getObjectUnitPosition";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { Direction } from "grid-engine";
import { type Tilemaps } from "phaser";

export const useReadNpcList = (tilemap: Tilemaps.Tilemap) => {
  const npcStore = useNpcStore();
  const { pushNpcList } = npcStore;
  const npcLayerNames = tilemap.getObjectLayerNames().filter((layerName) => layerName.includes(ObjectLayer.Npc));

  for (const npcLayerName of npcLayerNames) {
    const npcLayer = tilemap.getObjectLayer(npcLayerName);
    if (!npcLayer) continue;

    const npcObject = npcLayer.objects.find((obj) => obj.type === ObjectType.Npc);
    if (!(npcObject && npcObject.x && npcObject.y)) continue;

    const frameTiledObjectProperty = (npcObject.properties as TiledObjectProperty<string>[]).find(
      (p) => p.name === NpcObjectProperty.frame,
    );
    if (!frameTiledObjectProperty) continue;

    const messagesTiledObjectProperty = (npcObject.properties as TiledObjectProperty<string>[]).find(
      (p) => p.name === NpcObjectProperty.messages,
    );
    if (!messagesTiledObjectProperty) continue;

    const frame = parseInt(frameTiledObjectProperty.value);
    const messages = messagesTiledObjectProperty.value.split(MESSAGE_SEPARATOR);
    pushNpcList({
      id: `${CharacterId.Npc}${npcObject.name}`,
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
      position: getObjectUnitPosition({ x: npcObject.x, y: npcObject.y }),
      direction: Direction.DOWN,
      singleSidedSpritesheetDirection: Direction.RIGHT,
      messages,
    });
  }
};
