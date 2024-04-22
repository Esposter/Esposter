import { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";

export const AttackComponentMap: Record<AttackKey, Component> = {
  [AttackKey.Slash]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackKey.IceShard]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/IceShard.vue")),
};
