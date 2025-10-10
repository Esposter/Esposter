import type { Item } from "#shared/models/dungeons/item/Item";
import type { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { ItemEntityType } from "@esposter/shared";
import type { Promisable } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";

export abstract class AItemResolver implements ItemEntityType<ItemEffectType> {
  type;

  constructor(type: ItemEffectType) {
    this.type = type;
  }

  static postHandleItem(item: Ref<Item>) {
    const inventorySceneStore = useInventorySceneStore();
    const { inventory } = storeToRefs(inventorySceneStore);

    item.value.quantity--;
    if (item.value.quantity > 0) return;

    const index = inventory.value.findIndex(({ id }) => id === item.value.id);
    if (index === -1) return;
    inventory.value.splice(index, 1);
  }

  handleItem(_scene: SceneWithPlugins, _item: Ref<Item>, _monster: Ref<Monster>): Promisable<void> {}

  isActive(_item: Ref<Item>, _monster: Ref<Monster>): boolean {
    return true;
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
}
