import { ClickerType } from "@/models/clicker/ClickerType";

export const IconComponentMap = {
  [ClickerType.Default]: defineAsyncComponent(() => import("@/components/Clicker/Icon/PinaColada.vue")),
  [ClickerType.Physical]: defineAsyncComponent(() => import("@/components/Clicker/Icon/Strength.vue")),
  [ClickerType.Magical]: defineAsyncComponent(() => import("@/components/Clicker/Icon/PinaColada.vue")),
} satisfies Record<ClickerType, Component>;
