import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onNextTick } from "@/lib/phaser/hooks/onNextTick";
import { ExternalSceneStore } from "@/lib/phaser/store/scene";
// Determine the correct lifecycle to initialize a gameObject
export const useInitializeGameObjectLifecycleHook = () => {
  const sceneKey = useInjectSceneKey();
  return ExternalSceneStore.sceneReadyMap[sceneKey] ? onNextTick : onCreate;
};
