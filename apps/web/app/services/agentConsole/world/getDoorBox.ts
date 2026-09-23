import type { WorldPrompt } from "@/models/agentConsole/world/WorldPrompt";

import { DOOR_HINGE_POSITION, DOOR_PANEL_POSITION, DOOR_PANEL_SCALE } from "@/services/agentConsole/world/constants";
import { Box3, Matrix4 } from "three";
// The box around the door's panel as it is drawn, turned this far about its hinge: the panel's own voxel scaled and
// Placed, so the prompt's outline is the door's shape at every size the constants give it
export const getDoorBox = (angle: number): Pick<WorldPrompt, "max" | "min"> => {
  const box = new Box3(DOOR_PANEL_POSITION.clone(), DOOR_PANEL_POSITION.clone().add(DOOR_PANEL_SCALE)).applyMatrix4(
    new Matrix4().makeRotationY(angle).setPosition(DOOR_HINGE_POSITION),
  );
  return { max: box.max.toArray(), min: box.min.toArray() };
};
