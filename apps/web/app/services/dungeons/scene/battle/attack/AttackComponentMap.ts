import { AttackId } from "#shared/models/dungeons/attack/AttackId";

// Multiple attacks reuse one animation component — a new one is earned by looking distinct, not by existing
export const AttackComponentMap: Record<AttackId, Component> = {
  [AttackId.Bite]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId.Slash]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId["Aqua Jet"]]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/IceShard.vue")),
  [AttackId["Frost Fang"]]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/IceShard.vue")),
  [AttackId["Ice Shard"]]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/IceShard.vue")),
  [AttackId["Shadow Claw"]]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/Slash.vue")),
  [AttackId["Volt Claw"]]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Attack/Slash.vue")),
};
