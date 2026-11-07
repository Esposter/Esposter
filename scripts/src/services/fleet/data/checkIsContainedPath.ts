import { win32 } from "node:path";

// Whether a path stays inside the directory it is joined to: it names no drive, root or share, and no `..` climbs
// Above it. The Windows flavour reads both separators, since a path comes from a peer of either platform, so
// Every host judges it alike
export const checkIsContainedPath = (path: string): boolean => {
  const normalized = win32.normalize(path);
  return win32.parse(path).root === "" && normalized !== ".." && !normalized.startsWith(`..${win32.sep}`);
};
