// A glob names the directory it opens in, so it is cut at its first wildcard: `Profile/*.vue` and `Profile/**` both name
// `Profile`, which over-approximates the files they match. A trailing slash is then dropped, so `extracted/natlan/` and
// `extracted/natlan` name the same directory
const WILDCARD_REGEX = /[*?[]/u;
const normalizePath = (path: string): string => {
  const literal = path.slice(0, WILDCARD_REGEX.exec(path)?.index ?? path.length);
  return literal.replace(/\/+$/u, "");
};

// A path overlaps another when they are the same, or one is a directory the other lies under
const checkIsSameOrUnder = (path: string, otherPath: string): boolean =>
  path === otherPath || path.startsWith(`${otherPath}/`) || otherPath.startsWith(`${path}/`);

export const checkTouchesOverlap = (touches: readonly string[], otherTouches: readonly string[]): boolean =>
  touches.some((touch) =>
    otherTouches.some((otherTouch) => checkIsSameOrUnder(normalizePath(touch), normalizePath(otherTouch))),
  );
