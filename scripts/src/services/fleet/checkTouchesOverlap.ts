// A trailing slash is dropped first, so `extracted/natlan/` and `extracted/natlan` name the same directory
const normalizePath = (path: string): string => path.replace(/\/+$/u, "");

// A path overlaps another when they are the same, or one is a directory the other lies under
const checkIsSameOrUnder = (path: string, otherPath: string): boolean =>
  path === otherPath || path.startsWith(`${otherPath}/`) || otherPath.startsWith(`${path}/`);

export const checkTouchesOverlap = (touches: readonly string[], otherTouches: readonly string[]): boolean =>
  touches.some((touch) =>
    otherTouches.some((otherTouch) => checkIsSameOrUnder(normalizePath(touch), normalizePath(otherTouch))),
  );
