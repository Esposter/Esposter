import type { PlayerState } from "@/models/agentConsole/world/PlayerState";

import { CAMERA_START_AZIMUTH, DOOR_POSITION } from "@/services/agentConsole/world/constants";
import { Vector3 } from "three";
// The player walks in where the main agent does, at the door, facing into the room
export const createPlayerState = (): PlayerState => {
  const position = new Vector3(...DOOR_POSITION);
  return {
    cameraAzimuth: CAMERA_START_AZIMUTH,
    heading: Math.PI / 2,
    isOnGround: true,
    isSneaking: false,
    isSprinting: false,
    position,
    previousPosition: position.clone(),
    renderPosition: position.clone(),
    tickStep: 0,
    velocity: new Vector3(),
    walkedDistance: 0,
  };
};
