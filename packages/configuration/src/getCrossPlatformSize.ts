import { statSync } from "node:fs";
import { basename, resolve } from "node:path";

export const getCrossPlatformSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const sizeInBytes = statSync(absolutePath).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  const standardizedName = basename(absolutePath);
  return `${standardizedName}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};
