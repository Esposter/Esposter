import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { COLUMN_SIZE, ROW_SIZE } from "@/services/dungeons/scene/monsterParty/constants";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export class CaptureItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Capture);
  }

  async handleItem(scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) {
    const infoPanelStore = useInfoPanelStore();
    const { showMessages } = infoPanelStore;
    const oldHp = monster.value.status.hp;
    const newHp = Math.min(oldHp + item.value.effect.value, monster.value.stats.maxHp);

    monster.value.status.hp = newHp;
    await showMessages(scene, [`Captureed ${monster.value.key} by ${newHp - oldHp} HP.`]);
    phaserEventEmitter.emit("useItem", scene, item.value, monster.value);
  }

  isActive(item: Ref<Item>, _monster: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { monsters } = storeToRefs(monsterPartySceneStore);

    if (monsters.value.length >= COLUMN_SIZE * ROW_SIZE) {
      const infoPanelStore = useInfoPanelStore();
      const { infoDialogMessage } = storeToRefs(infoPanelStore);
      infoDialogMessage.value.text = `You have no room in your party! Cannot use ${item.value.id}.`;
      return false;
    }

    return true;
  }
}
