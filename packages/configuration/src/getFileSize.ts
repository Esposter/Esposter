import { statSync } from "node:fs";
import { basename, resolve } from "node:path";

import { KIBIBYTE } from "./constants";

export const getFileSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const sizeInBytes = statSync(absolutePath).size;
  const sizeInKB = (sizeInBytes / KIBIBYTE).toFixed(2);
  const standardizedName = basename(absolutePath);
  return `${standardizedName}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};
