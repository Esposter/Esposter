import type { ShopGoodCell } from "#src/models/ShopGoodCell";
import type { Ref } from "vue";

import { computed } from "vue";

interface ShopGoodPickOptions {
  // The count the player picked, which the picked good's most keeps it within
  count: Ref<number>;
  // The most the picked good can be bought for, its limit and the player's currency both counted
  getCountMaximum: () => number;
  // The goods the screen shows, in the shop's order, the picked good being one of them
  getGoods: () => ShopGoodCell[];
  // The id of the good the player picked, where none is picked
  goodId: Ref<number>;
}

/** The good the player picked, and the count kept within its most with the handler its slider reports through */
export const useShopGoodPick = ({ count, getCountMaximum, getGoods, goodId }: ShopGoodPickOptions) => {
  // The good the player picked, whose detail the screen shows
  const pickedGood = computed(() => getGoods().find((good) => good.id === goodId.value));
  // The count kept within the picked good's most, never less than one so the picker still reads as a count
  const pickedCount = computed(() => Math.min(Math.max(count.value, 1), Math.max(getCountMaximum(), 1)));
  const setCount = (event: Event) => {
    count.value = Number((event.target as HTMLInputElement).value);
  };
  return { pickedCount, pickedGood, setCount };
};
