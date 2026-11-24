import { LOGIN_DOOR_FORMING_LEAD_MS } from "#src/services/login/scene/constants";
import { LOGIN_WALKWAY_SUNK_DISTANCE } from "#src/services/login/walkway/constants";

// Whether the door has begun to form: its copy is within the walkway's far end plus the distance the glide covers in
// The forming's lead. Once the door is due the glide holds its pace until the door rises, where braking starts, so the
// Forming begins the lead before the rise, or with the door's being due when less glide is left than the lead
export const checkIsLoginDoorForming = (doorAheadOfCamera: number, speed: number): boolean =>
  doorAheadOfCamera <= LOGIN_WALKWAY_SUNK_DISTANCE + (speed * LOGIN_DOOR_FORMING_LEAD_MS) / 1000;
