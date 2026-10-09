import { statSync } from "node:fs";

// Whether the path is an existing file, false for a path that is missing or a directory
export const checkIsFile = (absolutePath: string): boolean =>
  statSync(absolutePath, { throwIfNoEntry: false })?.isFile() ?? false;
