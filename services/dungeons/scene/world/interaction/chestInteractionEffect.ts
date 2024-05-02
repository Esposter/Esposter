import { ChestObjectProperty } from "@/generated/tiled/propertyTypes/class/ChestObjectProperty";
import type { ItemId } from "@/generated/tiled/propertyTypes/enum/ItemId";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { getItem } from "@/services/dungeons/item/getItem";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const chestInteractionEffect: Effect = (chestObjects) => {
  const chestObject = useGetInteractiveObject(chestObjects);
  if (!chestObject) return false;

  const worldSceneStore = useWorldSceneStore();
  const { worldData } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  const itemIdTiledObjectProperty = getTiledObjectProperty<ItemId>(chestObject.properties, ChestObjectProperty.itemId);
  const chestId = getChestId(chestObject);
  const chest = worldData.value.chestMap.get(chestId);
  if (!chest || chest.isOpened) {
    showMessages([{ text: "There is nothing left in the chest." }]);
    return true;
  }

  const item = inventory.value.find((i) => i.id === itemIdTiledObjectProperty.value);
  if (item) item.quantity++;
  else inventory.value.push({ ...getItem(itemIdTiledObjectProperty.value), quantity: 1 });
  chest.isOpened = true;
  showMessages([{ text: `You've obtained ${itemIdTiledObjectProperty.value}.` }]);
  return true;
};
