import type { NavigationMark } from "#src/models/map/NavigationMark";

import { NAVIGATION_MARK_INSET_SHARE } from "#src/services/map/constants";

// Where the pointed landmark's mark stands on the screen, from its projection in normalised device coordinates, x and y
// Each from -1 to 1 with y up. Behind the camera a projection is mirrored through the centre, so its direction is turned
// Round. Out of view, the mark is held where its line from the centre leaves the screen, inset from the edge, and its arrow
// Turns along that line
export const computeNavigationMark = (
  { x, y }: { x: number; y: number },
  isBehind: boolean,
  aspect: number,
): NavigationMark => {
  const directionX = isBehind ? -x : x;
  const directionY = isBehind ? -y : y;
  const isOutOfView = isBehind || Math.abs(x) > 1 || Math.abs(y) > 1;
  const reach = Math.max(Math.abs(directionX), Math.abs(directionY));
  // A share of the screen is two units of normalised device coordinates, so the inset is taken off each edge twice. A
  // Projection exactly on the centre has no edge to run to, so it stays put
  const scale = isOutOfView && reach > 0 ? (1 - 2 * NAVIGATION_MARK_INSET_SHARE) / reach : 1;
  return {
    angle: Math.atan2(directionX * aspect, directionY),
    isOutOfView,
    left: (directionX * scale + 1) / 2,
    top: (1 - directionY * scale) / 2,
  };
};
