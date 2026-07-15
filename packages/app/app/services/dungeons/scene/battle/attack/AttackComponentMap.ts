import { AttackId } from "#shared/models/dungeons/attack/AttackId";

// Multiple attacks may reuse one animation component — new attacks only need new spritesheets
// When they should look distinct, not to exist.
export const AttackComponentMap: Record<AttackId, Component> = {
  [AttackId.Bite]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId.Slash]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId["Aqua Jet"]]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/IceShard.vue")),
  [AttackId["Frost Fang"]]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/IceShard.vue")),
  [AttackId["Ice Shard"]]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/IceShard.vue")),
  [AttackId["Shadow Claw"]]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId["Volt Claw"]]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Attack/Slash.vue")),
};
