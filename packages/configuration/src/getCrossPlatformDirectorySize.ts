import { readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

export const getCrossPlatformDirectorySize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const sizeInBytes = getDirectorySize(absolutePath);
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  return `${basename(absolutePath)}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};

const getDirectorySize = (targetPath: string): number =>
  readdirSync(targetPath, { withFileTypes: true }).reduce((total, entry) => {
    const fullPath = join(targetPath, entry.name);
    return total + (entry.isDirectory() ? getDirectorySize(fullPath) : statSync(fullPath).size);
  }, 0);
