import { ClickerType } from "@/shared/models/clicker/data/ClickerType";

export const IconComponentMap = {
  [ClickerType.Default]: defineAsyncComponent(() => import("@/components/Clicker/Icon/PinaColada.vue")),
  [ClickerType.Magical]: defineAsyncComponent(() => import("@/components/Clicker/Icon/Mana.vue")),
  [ClickerType.Physical]: defineAsyncComponent(() => import("@/components/Clicker/Icon/Strength.vue")),
} as const satisfies Record<ClickerType, Component>;
