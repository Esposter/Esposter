import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import type { Item } from "@/models/dungeons/item/Item";
import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export class HealItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Heal);
  }

  isActive(item: Ref<Item>, target: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const infoPanelStore = useInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(infoPanelStore);

    if (target.value.currentHp === 0) {
      infoDialogMessage.value.text = `Cannot heal fainted ${activeMonster.value.key}`;
      return false;
    } else if (target.value.currentHp === target.value.stats.maxHp) {
      infoDialogMessage.value.text = `${activeMonster.value.key} is already fully healed`;
      return false;
    }

    return true;
  }

  async handleItem(scene: SceneWithPlugins, item: Ref<Item>, target: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const infoPanelStore = useInfoPanelStore();
    const { showMessages } = infoPanelStore;
    const oldHp = target.value.currentHp;
    const newHp = Math.min(oldHp + item.value.effect.value, target.value.stats.maxHp);

    target.value.currentHp = newHp;
    await showMessages(scene, [`Healed ${activeMonster.value.key} by ${newHp - oldHp} HP.`], () => {
      phaserEventEmitter.emit("useItem", item.value, scene.scene.key);
    });
  }
}
