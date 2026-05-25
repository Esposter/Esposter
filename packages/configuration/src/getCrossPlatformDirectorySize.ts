import { TEXT_FILE_EXTENSIONS } from "@/constants";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

export const getCrossPlatformDirectorySize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const sizeInBytes = getNormalizedDirectorySize(absolutePath);
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  return `${basename(absolutePath)}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};

const getNormalizedDirectorySize = (targetPath: string): number =>
  readdirSync(targetPath, { withFileTypes: true }).reduce((total, entry) => {
    const fullPath = join(targetPath, entry.name);
    return total + (entry.isDirectory() ? getNormalizedDirectorySize(fullPath) : getNormalizedFileSize(fullPath));
  }, 0);

const getNormalizedFileSize = (targetPath: string): number =>
  TEXT_FILE_EXTENSIONS.has(extname(targetPath))
    ? Buffer.byteLength(readFileSync(targetPath).toString("utf8").replaceAll("\r\n", "\n"), "utf8")
    : statSync(targetPath).size;
