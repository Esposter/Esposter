/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Item } from "@/models/dungeons/item/Item";
import type { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export abstract class AItemResolver {
  // @TODO: Ideally if we had es decorators we would be able to look up the class
  // if we knew the type, instead of storing the value then validating against it >:C
  type: ItemEffectType;

  constructor(type: ItemEffectType) {
    this.type = type;
  }

  static preValidate(item: Ref<Item>): boolean {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { infoText } = storeToRefs(monsterPartySceneStore);

    if (item.value.quantity === 0) {
      infoText.value = `No more ${item.value.name} available`;
      return false;
    }

    return true;
  }

  validate(item: Ref<Item>, target: Ref<Monster>): boolean {
    return true;
  }

  handleItem(item: Ref<Item>, target: Ref<Monster>): void {}

  static postHandleItem(item: Ref<Item>) {
    const inventorySceneStore = useInventorySceneStore();
    const { inventory } = storeToRefs(inventorySceneStore);
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { selectedItemIndex } = storeToRefs(monsterPartySceneStore);

    item.value.quantity--;
    if (item.value.quantity === 0) inventory.value.splice(selectedItemIndex.value, 1);
  }
}
