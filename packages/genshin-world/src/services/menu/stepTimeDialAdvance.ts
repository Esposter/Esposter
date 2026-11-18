import { clampTimeAdvance } from "#src/services/menu/clampTimeAdvance";
import { MINUTES_PER_DAY } from "genshin-engine";

// The advance the Time dial shows once its pointer has moved from one angle about the dial's centre to another: the
// Shorter way round between the two, a full turn being a day, and kept within the advance's bounds so a drag back past
// The minimum does not have to be undone before the dial moves again
export const stepTimeDialAdvance = (advanceMinutes: number, fromAngle: number, toAngle: number): number => {
  const turn = Math.atan2(Math.sin(toAngle - fromAngle), Math.cos(toAngle - fromAngle));
  return clampTimeAdvance(advanceMinutes + (turn / (2 * Math.PI)) * MINUTES_PER_DAY);
};
