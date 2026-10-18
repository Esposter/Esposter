import type { DishUse } from "#src/models/cooking/DishUse";

import { readDishes } from "#src/services/cooking/readDishes";
import { getResultAsync } from "@esposter/shared";
import { shallowRef } from "vue";

// The dishes' uses as the world starts, each by the item id its dish is eaten from, read from the hosted game data
export const useWorldDishes = (gameDataBaseUrl: string) => {
  const dishUseMap = shallowRef<ReadonlyMap<number, DishUse>>(new Map());
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readDishes(gameDataBaseUrl)).match(
    (dishes) => {
      dishUseMap.value = new Map(Object.entries(dishes).map(([itemId, dishUse]) => [Number(itemId), dishUse]));
    },
    (error) => {
      console.error(error);
    },
  );
  return { dishUseMap };
};
