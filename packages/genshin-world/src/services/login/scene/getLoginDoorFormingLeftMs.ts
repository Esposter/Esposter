import { LOGIN_DOOR_FORMING_LEAD_MS } from "#src/services/login/constants";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";

// The lead left before the door rises, in milliseconds, once the door's copy is within the walkway's far end plus the
// Distance the glide covers in the lead, or undefined before that. Once the door is due the glide holds its pace until
// It rises, so the time left is the distance to the far end over the speed, and zero once the door has risen
export const getLoginDoorFormingLeftMs = (doorAheadOfCamera: number, speed: number): number | undefined => {
  const distanceToRise = doorAheadOfCamera - LOGIN_WALKWAY_SUNK_DISTANCE;
  const leftMs = distanceToRise <= 0 ? 0 : (distanceToRise / speed) * 1000;
  return leftMs <= LOGIN_DOOR_FORMING_LEAD_MS ? leftMs : undefined;
};
