import type { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const useSceneStore = defineStore("dungeons/scene", () => {
  // This is a stack of all the previous scene keys pushed by usePreviousScene
  const previousSceneKeyStack = ref<SceneKey[]>([]);
  const previousSceneKey = computed(() => previousSceneKeyStack.value[previousSceneKeyStack.value.length - 1]);
  return { previousSceneKey, previousSceneKeyStack };
});
