import type { Item } from "@/models/dungeons/item/Item";
import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useItemStore } from "@/store/dungeons/inventory/item";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";

export abstract class AItemResolver {
  type: ItemEffectType;

  constructor(type: ItemEffectType) {
    this.type = type;
  }

  validate(item: Ref<Item>): boolean {
    if (item.value.effect.type !== this.type) return false;

    const infoPanelStore = useInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(infoPanelStore);

    if (item.value.quantity === 0) {
      infoDialogMessage.value.text = `No more ${item.value.id} available.`;
      return false;
    }

    return true;
  }

  isActive(_item: Ref<Item>, _monster: Ref<Monster>): boolean {
    return true;
  }

  handleItem(_scene: SceneWithPlugins, _item: Ref<Item>, _monster: Ref<Monster>): void {}

  static postHandleItem(item: Ref<Item>) {
    const inventorySceneStore = useInventorySceneStore();
    const { inventory } = storeToRefs(inventorySceneStore);
    const itemStore = useItemStore();
    const { selectedItemIndex } = storeToRefs(itemStore);

    item.value.quantity--;
    if (item.value.quantity === 0) inventory.value.splice(selectedItemIndex.value, 1);
  }
}
