import type { LoginScrollRow } from "#src/models/login/LoginScrollRow";

import {
  LOGIN_GLIDE_DOOR_SCROLLED,
  LOGIN_GLIDE_TITLE_WALKWAY_PHASE,
  LOGIN_RECORDED_GLIDE_TO_DOOR,
} from "#src/services/login/scene/constants";

// The moment of the loop the title opens at, as metres scrolled: the walkway at its phase, on the copy that stands the
// Towers nearest the recorded glide short of where the glide rests at the door
export const computeLoginGlideTitleScrolled = ({ length }: LoginScrollRow): number =>
  LOGIN_GLIDE_TITLE_WALKWAY_PHASE +
  length *
    Math.round((LOGIN_GLIDE_DOOR_SCROLLED - LOGIN_RECORDED_GLIDE_TO_DOOR - LOGIN_GLIDE_TITLE_WALKWAY_PHASE) / length);
