import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";

export class HealItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Heal);
  }

  async handleItem(scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) {
    const infoPanelStore = useInfoPanelStore();
    const { showMessages } = infoPanelStore;
    const oldHp = monster.value.status.hp;
    const newHp = Math.min(oldHp + item.value.effect.value, monster.value.stats.maxHp);

    monster.value.status.hp = newHp;
    await showMessages(scene, [`Healed ${monster.value.key} by ${newHp - oldHp} HP.`]);
    phaserEventEmitter.emit("useItem", scene, item.value, monster.value);
  }

  isActive(_item: Ref<Item>, monster: Ref<Monster>) {
    const infoPanelStore = useInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(infoPanelStore);

    if (monster.value.status.hp === 0) {
      infoDialogMessage.value.text = `Cannot heal fainted ${monster.value.key}.`;
      return false;
    } else if (monster.value.status.hp === monster.value.stats.maxHp) {
      infoDialogMessage.value.text = `${monster.value.key} is already fully healed.`;
      return false;
    }

    return true;
  }
}
