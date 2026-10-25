import { checkIsSameOrUnder } from "#src/services/fleet/checkIsSameOrUnder";
import { normalizePath } from "#src/services/fleet/normalizePath";

export const checkTouchesOverlap = (touches: readonly string[], otherTouches: readonly string[]): boolean =>
  touches.some((touch) =>
    otherTouches.some((otherTouch) => checkIsSameOrUnder(normalizePath(touch), normalizePath(otherTouch))),
  );
