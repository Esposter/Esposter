import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { DirectionalLight, HemisphereLight, Vector3 } from "three";

// The scene's sun or moon and its sky's ambient light, scaled from the strengths the scene set them at, each held at its
// Own strength unless a share is given, and the direction the sun's light falls from: a tool reads what each light
// Alone draws, so the two strengths are solved apart. The first call keeps each light's own strength to scale from
export const setSceneLights = (
  context: SceneContext | undefined,
  { ambientShare = 1, sunShare = 1 }: { ambientShare?: number; sunShare?: number },
): { direction: [number, number, number] } => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  let direction: [number, number, number] = [0, 1, 0];
  context.scene.traverse((object) => {
    if (object instanceof HemisphereLight) {
      object.userData.ownIntensity ??= object.intensity;
      object.intensity = (object.userData.ownIntensity as number) * ambientShare;
    } else if (object instanceof DirectionalLight && object.castShadow) {
      object.userData.ownIntensity ??= object.intensity;
      // The god rays' own light casts the sun's shadow for them and lights nothing, so it is neither scaled nor read
      if (object.userData.ownIntensity === 0) return;
      object.intensity = (object.userData.ownIntensity as number) * sunShare;
      direction = new Vector3().subVectors(object.position, object.target.position).normalize().toArray();
    }
  });
  return { direction };
};
