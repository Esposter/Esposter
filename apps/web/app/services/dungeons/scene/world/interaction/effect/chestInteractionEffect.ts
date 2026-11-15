import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import type { Effect } from "#src/models/dungeons/scene/world/interaction/Effect";

import { ChestObjectProperty } from "#shared/generated/tiled/propertyTypes/class/ChestObjectProperty";
import { SoundEffectKey } from "#shared/models/dungeons/keys/sound/SoundEffectKey";
import { getItem } from "#shared/services/dungeons/item/getItem";
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { getDungeonsSoundEffect } from "#src/services/dungeons/sound/getDungeonsSoundEffect";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { useInventorySceneStore } from "#src/store/dungeons/inventory/scene";
import { useWorldDialogStore } from "#src/store/dungeons/world/dialog";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";

export const chestInteractionEffect: Effect = async (scene, chestObjects) => {
  const chestObject = useInteractiveObject(chestObjects);
  if (!chestObject) return false;

  const worldSceneStore = useWorldSceneStore();
  const { worldData } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  const itemIdTiledObjectProperty = getTiledObjectProperty<ItemId>(chestObject.properties, ChestObjectProperty.ItemId);
  const positionId = getPositionId(chestObject);
  const chest = worldData.value.chestMap[positionId];
  if (!chest || chest.isOpened) {
    await showMessages(scene, [{ text: "There is nothing left in the chest." }]);
    return true;
  }

  const item = inventory.value.find(({ id }) => id === itemIdTiledObjectProperty.value);
  if (item) item.quantity++;
  else inventory.value.push({ ...getItem(itemIdTiledObjectProperty.value), quantity: 1 });
  chest.isOpened = true;

  getDungeonsSoundEffect(scene, SoundEffectKey.OpenChest).play();
  await showMessages(scene, [{ text: `You've obtained ${itemIdTiledObjectProperty.value}.` }]);
  return true;
};
