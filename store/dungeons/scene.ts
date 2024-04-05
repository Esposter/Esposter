import type { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const useSceneStore = defineStore("dungeons/scene", () => {
  // This is a stack of all the previous scene keys pushed by usePreviousScene
  const previousSceneKeys = ref<SceneKey[]>([]);
  return { previousSceneKeys };
});
