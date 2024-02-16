import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type TiledObjectProperty } from "@/models/dungeons/tile/TiledObjectProperty";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { NPCObjectProperty } from "@/models/dungeons/world/home/NPCObjectProperty";
import { ObjectLayer } from "@/models/dungeons/world/home/ObjectLayer";
import { ObjectType } from "@/models/dungeons/world/home/ObjectType";
import { useNPCStore } from "@/store/dungeons/world/npc";
import { type Tilemaps } from "phaser";

export const useReadNPCList = (tilemap: Tilemaps.Tilemap) => {
  const npcStore = useNPCStore();
  const { pushNPCList } = npcStore;
  const npcLayerNames = tilemap.getObjectLayerNames().filter((layerName) => layerName.includes(ObjectLayer.NPC));

  for (const npcLayerName of npcLayerNames) {
    const npcLayer = tilemap.getObjectLayer(npcLayerName);
    if (!npcLayer) continue;

    const npcObject = npcLayer.objects.find((obj) => obj.type === ObjectType.npc);
    if (!(npcObject && npcObject.x && npcObject.y)) continue;

    const frameTiledObjectProperty = (npcObject.properties as TiledObjectProperty<string>[]).find(
      (p) => p.name === NPCObjectProperty.frame,
    );
    if (!frameTiledObjectProperty) continue;

    pushNPCList([
      {
        id: `${CharacterId.NPC}${npcObject.name}`,
        asset: { key: SpritesheetKey.NPC, frame: parseInt(frameTiledObjectProperty.value) },
        walkingAnimationMapping: {
          up: {
            leftFoot: 0,
            standing: 1,
            rightFoot: 2,
          },
          down: {
            leftFoot: 6,
            standing: 7,
            rightFoot: 8,
          },
          left: {
            leftFoot: 9,
            standing: 10,
            rightFoot: 11,
          },
          right: {
            leftFoot: 3,
            standing: 4,
            rightFoot: 5,
          },
        },
        startPosition: {
          x: npcObject.x,
          y: npcObject.y,
        },
      },
    ]);
  }
};
