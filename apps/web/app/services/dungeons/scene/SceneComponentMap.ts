import { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const SceneComponentMap = {
  [SceneKey.Battle]: defineAsyncComponent(() => import("@/components/Dungeons/Battle/Scene.vue")),
  [SceneKey.Inventory]: defineAsyncComponent(() => import("@/components/Dungeons/Inventory/Scene.vue")),
  [SceneKey.MobileJoystick]: defineAsyncComponent(() => import("@/components/Dungeons/MobileJoystick/Scene.vue")),
  [SceneKey.MonsterDetails]: defineAsyncComponent(() => import("@/components/Dungeons/MonsterDetails/Scene.vue")),
  [SceneKey.MonsterParty]: defineAsyncComponent(() => import("@/components/Dungeons/MonsterParty/Scene.vue")),
  [SceneKey.Preloader]: defineAsyncComponent(() => import("@/components/Dungeons/Preloader/Scene.vue")),
  [SceneKey.Settings]: defineAsyncComponent(() => import("@/components/Dungeons/Settings/Scene.vue")),
  [SceneKey.Title]: defineAsyncComponent(() => import("@/components/Dungeons/Title/Scene.vue")),
  [SceneKey.World]: defineAsyncComponent(() => import("@/components/Dungeons/World/Scene.vue")),
} as const satisfies Record<SceneKey, Component>;
// Derived at the map rather than at the page that mounts them, so the scenes and their keys cannot drift apart
export const SceneComponentEntries = Object.entries(SceneComponentMap);
