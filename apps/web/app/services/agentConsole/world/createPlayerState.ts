import type { PlayerState } from "@/models/agentConsole/world/PlayerState";

import { WorldObjectType } from "@/models/agentConsole/world/WorldObjectType";
import { CAMERA_START_AZIMUTH } from "@/services/agentConsole/world/constants";
import { WorldObjectMap } from "@/services/agentConsole/world/WorldObjectMap";
import { Vector3 } from "three";
// The player walks in where the main agent does, at the door, facing into the room
export const createPlayerState = (): PlayerState => {
  const position = new Vector3(...WorldObjectMap[WorldObjectType.Door].standPosition);
  return {
    cameraAzimuth: CAMERA_START_AZIMUTH,
    heading: Math.PI / 2,
    isOnGround: true,
    isSneaking: false,
    isSprinting: false,
    position,
    previousPosition: position.clone(),
    renderPosition: position.clone(),
    velocity: new Vector3(),
    walkedDistance: 0,
  };
};
