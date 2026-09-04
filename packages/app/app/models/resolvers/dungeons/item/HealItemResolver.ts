import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useMonsterPartyInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";

export class HealItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Heal);
  }

  override async handleItem(scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) {
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { showMessages } = monsterPartyInfoPanelStore;
    const oldHealth = monster.value.status.health;
    const newHealth = Math.min(oldHealth + item.value.effect.value, monster.value.statistics.maxHealth);

    monster.value.status.health = newHealth;
    await showMessages(scene, [`Healed ${monster.value.key} by ${newHealth - oldHealth} HP.`]);
    phaserEventEmitter.emit("useItem", scene, item.value, monster.value, () =>
      battleStateMachine.setState(StateName.EnemyInput),
    );
  }

  override isActive(_item: Ref<Item>, monster: Ref<Monster>) {
    const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);

    if (monster.value.status.health === 0) {
      infoDialogMessage.value.text = `Cannot heal fainted ${monster.value.key}.`;
      return false;
    } else if (monster.value.status.health === monster.value.statistics.maxHealth) {
      infoDialogMessage.value.text = `${monster.value.key} is already fully healed.`;
      return false;
    }

    return true;
  }
}
