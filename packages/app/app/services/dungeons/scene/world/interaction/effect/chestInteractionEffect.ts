import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { ChestObjectProperty } from "#shared/generated/tiled/propertyTypes/class/ChestObjectProperty";
import { getPositionId } from "@/services/dungeons/direction/getPositionId";
import { getItem } from "@/services/dungeons/item/getItem";
import { getDungeonsSoundEffect } from "@/services/dungeons/sound/getDungeonsSoundEffect";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const chestInteractionEffect: Effect = async (scene, chestObjects) => {
  const chestObject = useGetInteractiveObject(chestObjects);
  if (!chestObject) return false;

  const worldSceneStore = useWorldSceneStore();
  const { worldData } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  const itemIdTiledObjectProperty = getTiledObjectProperty<ItemId>(chestObject.properties, ChestObjectProperty.itemId);
  const positionId = getPositionId(chestObject);
  const chest = worldData.value.chestMap[positionId];
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!chest || chest.isOpened) {
    await showMessages(scene, [{ text: "There is nothing left in the chest." }]);
    return true;
  }

  const item = inventory.value.find((i) => i.id === itemIdTiledObjectProperty.value);
  if (item) item.quantity++;
  else inventory.value.push({ ...getItem(itemIdTiledObjectProperty.value), quantity: 1 });
  chest.isOpened = true;

  getDungeonsSoundEffect(scene, FileKey.SoundOpenChest).play();
  await showMessages(scene, [{ text: `You've obtained ${itemIdTiledObjectProperty.value}.` }]);
  return true;
};
