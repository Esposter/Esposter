import type { SceneContext } from "#src/models/scene/SceneContext";
import type { UniformNode } from "three/webgpu";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The share of each band's clouds the sky draws, by the band's name, or handed back to the scene's own when none are
// Given: a tool reads the cover each share draws, so each band's is solved against a reference's. The first call keeps
// The scene's own. A band's sprite hands on its cover, and the bands' names are handed back
export const setSceneCloudCover = (context: SceneContext | undefined, covers?: Record<string, number>): string[] => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  const bands: string[] = [];
  context.scene.traverse((object) => {
    const cover = object.userData.cover as undefined | UniformNode<"float", number>;
    if (!cover) return;
    object.userData.ownCover ??= cover.value;
    cover.value = covers?.[object.name] ?? (object.userData.ownCover as number);
    bands.push(object.name);
  });
  return bands;
};
