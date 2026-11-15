import { SceneKey } from "#src/models/dungeons/keys/SceneKey";

export const SceneComponentMap = {
  [SceneKey.Battle]: defineAsyncComponent(() => import("#src/components/Dungeons/Battle/Scene.vue")),
  [SceneKey.Inventory]: defineAsyncComponent(() => import("#src/components/Dungeons/Inventory/Scene.vue")),
  [SceneKey.MobileJoystick]: defineAsyncComponent(() => import("#src/components/Dungeons/MobileJoystick/Scene.vue")),
  [SceneKey.MonsterDetails]: defineAsyncComponent(() => import("#src/components/Dungeons/MonsterDetails/Scene.vue")),
  [SceneKey.MonsterParty]: defineAsyncComponent(() => import("#src/components/Dungeons/MonsterParty/Scene.vue")),
  [SceneKey.Preloader]: defineAsyncComponent(() => import("#src/components/Dungeons/Preloader/Scene.vue")),
  [SceneKey.Settings]: defineAsyncComponent(() => import("#src/components/Dungeons/Settings/Scene.vue")),
  [SceneKey.Title]: defineAsyncComponent(() => import("#src/components/Dungeons/Title/Scene.vue")),
  [SceneKey.World]: defineAsyncComponent(() => import("#src/components/Dungeons/World/Scene.vue")),
} as const satisfies Record<SceneKey, Component>;
// Derived at the map rather than at the page that mounts them, so the scenes and their keys cannot drift apart
export const SceneComponentEntries = Object.entries(SceneComponentMap);
