import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onNextTick } from "@/lib/phaser/hooks/onNextTick";
import { ExternalSceneStore } from "@/lib/phaser/store/scene";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
// Determine the correct lifecycle to initialize a gameObject
export const getInitializeGameObjectLifecycleHook = (sceneKey: SceneKey) =>
  ExternalSceneStore.sceneReadyMap[sceneKey] ? onNextTick : onCreate;
