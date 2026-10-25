// A path overlaps another when they are the same, or one is a directory the other lies under, the root holding every path
export const checkIsSameOrUnder = (path: string, otherPath: string): boolean =>
  path === "" ||
  otherPath === "" ||
  path === otherPath ||
  path.startsWith(`${otherPath}/`) ||
  otherPath.startsWith(`${path}/`);
