import { AttackId } from "@/models/dungeons/attack/AttackId";

export const AttackComponentMap: Record<AttackId, Component> = {
  [AttackId.Slash]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId.IceShard]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/IceShard.vue")),
};
