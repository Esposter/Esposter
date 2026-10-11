import { statSync } from "node:fs";

// A path that exists and is a file, false for a missing path and for a directory alike
export const checkIsFile = (path: string): boolean => statSync(path, { throwIfNoEntry: false })?.isFile() ?? false;
