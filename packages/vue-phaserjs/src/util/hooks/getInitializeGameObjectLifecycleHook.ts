import { onCreate } from "#src/hooks/onCreate";
import { onNextTick } from "#src/hooks/onNextTick";
import { ExternalSceneStore } from "#src/store/scene";
// Determine the correct lifecycle to initialize a gameObject
export const getInitializeGameObjectLifecycleHook = (sceneKey: string) =>
  ExternalSceneStore.sceneReadyMap.get(sceneKey) ? onNextTick : onCreate;
