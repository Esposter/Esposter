// A glob names the directory it opens in, so it is cut at the last slash before its first wildcard: `Profile/*.vue`,
// `Profile/Story*.vue` and `Profile/**` all name `Profile`, which over-approximates the files they match, and a glob
// With no slash before its wildcard, `*.md`, names the repository's root as the empty path. A trailing slash is then
// Dropped, so `extracted/natlan/` and `extracted/natlan` name the same directory
const WILDCARD_REGEX = /[*?[]/u;
const normalizePath = (path: string): string => {
  const wildcardIndex = WILDCARD_REGEX.exec(path)?.index;
  const literal = wildcardIndex === undefined ? path : path.slice(0, path.lastIndexOf("/", wildcardIndex) + 1);
  return literal.replace(/\/+$/u, "");
};

// A path overlaps another when they are the same, or one is a directory the other lies under, the root holding every path
const checkIsSameOrUnder = (path: string, otherPath: string): boolean =>
  path === "" ||
  otherPath === "" ||
  path === otherPath ||
  path.startsWith(`${otherPath}/`) ||
  otherPath.startsWith(`${path}/`);

export const checkTouchesOverlap = (touches: readonly string[], otherTouches: readonly string[]): boolean =>
  touches.some((touch) =>
    otherTouches.some((otherTouch) => checkIsSameOrUnder(normalizePath(touch), normalizePath(otherTouch))),
  );
