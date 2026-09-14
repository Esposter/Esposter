import type { Item } from "#shared/models/dungeons/item/Item";
import type { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { ItemEntityType } from "@esposter/shared";
import type { Promisable } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";

import { useMonsterPartyInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";

export abstract class AItemResolver implements ItemEntityType<ItemEffectType> {
  type;

  constructor(type: ItemEffectType) {
    this.type = type;
  }

  checkIsActive(_item: Ref<Item>, _monster: Ref<Monster>): boolean {
    return true;
  }

  checkIsValid(item: Ref<Item>): boolean {
    if (item.value.effect.type !== this.type) return false;

    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);

    if (item.value.quantity === 0) {
      infoDialogMessage.value.text = `No more ${item.value.id} available.`;
      return false;
    }

    return true;
  }

  handleItem(_scene: SceneWithPlugins, _item: Ref<Item>, _monster: Ref<Monster>): Promisable<void> {}
}
