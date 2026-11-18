import type { ScreenRecords } from "#src/models/screen/ScreenRecords";
import type { Ref } from "vue";

import { computed } from "vue";

// The dishes' uses, each by the item id its dish is eaten from, as the bag reads them once the dishes are read as it opens
export const useWorldDishes = ({ dishes }: { dishes: Readonly<Ref<ScreenRecords["dishes"] | undefined>> }) => {
  const dishUseMap = computed(
    () => new Map(Object.entries(dishes.value ?? {}).map(([itemId, dishUse]) => [Number(itemId), dishUse])),
  );
  return { dishUseMap };
};
