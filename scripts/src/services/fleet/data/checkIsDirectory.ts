import { statSync } from "node:fs";

// Whether the path is an existing directory, false for a path that is missing or a file
export const checkIsDirectory = (absolutePath: string): boolean =>
  statSync(absolutePath, { throwIfNoEntry: false })?.isDirectory() ?? false;
