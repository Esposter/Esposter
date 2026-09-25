import type { SceneKey } from "@/models/dungeons/keys/SceneKey";

import { takeOne } from "@esposter/shared";

export const useSceneStore = defineStore("dungeons/scene", () => {
  // This is a stack of all the previous scene keys pushed by usePreviousScene
  const previousSceneKeyStack = ref<SceneKey[]>([]);
  const previousSceneKey = computed(() => takeOne(previousSceneKeyStack.value, previousSceneKeyStack.value.length - 1));
  // Pops every key stacked above the last `sceneKey` and hands them back top first — the whole stack when it holds none
  const popSceneKeysAbove = (sceneKey: SceneKey) => {
    const keptLength = previousSceneKeyStack.value.lastIndexOf(sceneKey) + 1;
    const poppedSceneKeys = previousSceneKeyStack.value.slice(keptLength).toReversed();
    previousSceneKeyStack.value = previousSceneKeyStack.value.slice(0, keptLength);
    return poppedSceneKeys;
  };
  return { popSceneKeysAbove, previousSceneKey, previousSceneKeyStack };
});
