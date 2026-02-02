import type { SceneKey } from "#shared/models/dungeons/keys/SceneKey";

import { takeOne } from "@esposter/shared";

export const useSceneStore = defineStore("dungeons/scene", () => {
  // This is a stack of all the previous scene keys pushed by usePreviousScene
  const previousSceneKeyStack = ref<SceneKey[]>([]);
  const previousSceneKey = computed(() => takeOne(previousSceneKeyStack.value, previousSceneKeyStack.value.length - 1));
  return { previousSceneKey, previousSceneKeyStack };
});
