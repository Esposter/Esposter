import type { Item } from "@/models/dungeons/item/Item";
import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { useItemStore } from "@/store/dungeons/inventory/item";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export class HealItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Heal);
  }

  validate(item: Ref<Item>, target: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const infoPanelStore = useInfoPanelStore();
    const { infoDialogMessage } = storeToRefs(infoPanelStore);

    if (target.value.currentHp === 0) {
      infoDialogMessage.value.text = `Cannot heal fainted ${activeMonster.value.name}`;
      return false;
    } else if (target.value.currentHp === target.value.stats.maxHp) {
      infoDialogMessage.value.text = `${activeMonster.value.name} is already fully healed`;
      return false;
    }

    return true;
  }

  handleItem(item: Ref<Item>, target: Ref<Monster>, sceneKey: SceneKey) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const itemStore = useItemStore();
    const { onUseItemComplete } = storeToRefs(itemStore);
    const infoPanelStore = useInfoPanelStore();
    const { showMessages } = infoPanelStore;
    const oldHp = target.value.currentHp;
    const newHp = Math.min(oldHp + item.value.effect.value, target.value.stats.maxHp);

    target.value.currentHp = newHp;
    showMessages([`Healed ${activeMonster.value.name} by ${newHp - oldHp} HP`], () => {
      onUseItemComplete.value?.(item.value, sceneKey);
    });
  }
}
