import { ClickerType } from "#shared/models/clicker/data/ClickerType";

export const ClickerIconComponentMap = {
  [ClickerType.Default]: defineAsyncComponent(() => import("#src/components/Clicker/Icon/PinaColada.vue")),
  [ClickerType.Magical]: defineAsyncComponent(() => import("#src/components/Clicker/Icon/Mana.vue")),
  [ClickerType.Physical]: defineAsyncComponent(() => import("#src/components/Clicker/Icon/Strength.vue")),
} as const satisfies Record<ClickerType, Component>;
