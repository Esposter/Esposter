import type { Object3D } from "three";

import { OBJECT_FADE_KEY } from "#src/nodes/constants";

// Sets how far a mesh has faded in, which a material's `createObjectFadeNode` reads as the mesh is drawn
export const setObjectFade = (object: Object3D, fade: number): void => {
  object.userData[OBJECT_FADE_KEY] = fade;
};
