import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { formatByteSize } from "./formatByteSize";

export const getDirectorySize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  return formatByteSize(absolutePath, baseGetDirectorySize(absolutePath));
};

const baseGetDirectorySize = (targetPath: string): number =>
  readdirSync(targetPath, { withFileTypes: true }).reduce((total, entry) => {
    const fullPath = join(targetPath, entry.name);
    return total + (entry.isDirectory() ? baseGetDirectorySize(fullPath) : statSync(fullPath).size);
  }, 0);
