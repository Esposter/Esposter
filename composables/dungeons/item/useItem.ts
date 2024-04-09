import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { getAllItemResolvers } from "@/services/dungeons/item/getAllItemResolvers";
import { useMonsterPartyItemStore } from "@/store/dungeons/monsterParty/item";

export const useItem = (item: Ref<Item>, target: Ref<Monster>) => {
  const itemResolvers = getAllItemResolvers();
  let handled = false;

  for (const itemResolver of itemResolvers) {
    if (!(itemResolver.preValidate(item) && itemResolver.validate(item, target))) continue;
    itemResolver.handleItem(item, target);
    handled = true;
    break;
  }

  const monsterPartyItemStore = useMonsterPartyItemStore();
  const { onUseItemComplete } = storeToRefs(monsterPartyItemStore);

  if (handled) {
    AItemResolver.postHandleItem(item);
    onUseItemComplete.value?.(item.value);
  }
};
