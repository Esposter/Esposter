import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

export const getCrossPlatformSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const rawContent = readFileSync(absolutePath);
  const normalizedContent = rawContent.toString("utf8").replaceAll("\r\n", "\n");
  const sizeInBytes = Buffer.byteLength(normalizedContent, "utf8");
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  const standardizedName = basename(absolutePath);
  return `${standardizedName}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};
