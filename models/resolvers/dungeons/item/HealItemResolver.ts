import type { Item } from "@/models/dungeons/item/Item";
import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export class HealItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Heal);
  }

  validate(item: Ref<Item>, target: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster, infoText } = storeToRefs(monsterPartySceneStore);

    if (target.value.currentHp === 0) {
      infoText.value = `Cannot heal fainted ${activeMonster.value.name}`;
      return false;
    } else if (target.value.currentHp === target.value.stats.maxHp) {
      infoText.value = `${activeMonster.value.name} is already fully healed`;
      return false;
    }

    return true;
  }

  handleItem(item: Ref<Item>, target: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster, infoText } = storeToRefs(monsterPartySceneStore);
    const oldHp = target.value.currentHp;
    const newHp = Math.min(oldHp + item.value.effect.value, target.value.stats.maxHp);

    target.value.currentHp = newHp;
    infoText.value = `Healed ${activeMonster.value.name} by ${newHp - oldHp} HP`;
  }
}
