import { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const SceneKeyMap = {
  [SceneKey.Battle]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Scene.vue")),
  [SceneKey.MonsterParty]: defineAsyncComponent(() => import("@/components/Dungeons/MonsterParty/Scene.vue")),
  [SceneKey.Preloader]: defineAsyncComponent(() => import("@/components/Dungeons/Preloader/Scene.vue")),
  [SceneKey.Settings]: defineAsyncComponent(() => import("@/components/Dungeons/Settings/Scene.vue")),
  [SceneKey.Title]: defineAsyncComponent(() => import("@/components/Dungeons/Title/Scene.vue")),
  [SceneKey.World]: defineAsyncComponent(() => import("@/components/Dungeons/World/Scene.vue")),
} as const satisfies Record<SceneKey, Component>;
