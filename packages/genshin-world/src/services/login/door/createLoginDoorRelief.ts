import type { LoginDoor } from "#src/models/login/LoginDoor";
import type { Node } from "three/webgpu";

import { SceneAxis } from "#src/models/scene/SceneAxis";
import { LOGIN_DOOR_RELIEF_PIXELS_PER_METRE } from "#src/services/login/door/constants";
import { createPlanTonesNode } from "#src/services/login/scene/createPlanTonesNode";

// The colour the door's front is painted over its stone, in the tones `fitLoginDoor` read off its texture, drawn over
// Its front and read where the frame's and the panel's own geometry stand on it
export const createLoginDoorRelief = (door: LoginDoor): Node<"vec3"> => {
  const { corner, size, ...tones } = door.relief;
  return createPlanTonesNode(
    {
      axes: [SceneAxis.X, SceneAxis.Y],
      corner,
      normalAxis: SceneAxis.Z,
      pixelsPerMetre: LOGIN_DOOR_RELIEF_PIXELS_PER_METRE,
      size,
    },
    tones,
  );
};
