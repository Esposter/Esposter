import { onCreate } from "@/hooks/onCreate";
import { onNextTick } from "@/hooks/onNextTick";
import { ExternalSceneStore } from "@/store/scene";
// Determine the correct lifecycle to initialize a gameObject
export const getInitializeGameObjectLifecycleHook = (sceneKey: string) =>
  ExternalSceneStore.sceneReadyMap.get(sceneKey) ? onNextTick : onCreate;
