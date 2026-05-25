import { readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

const TEXT_FILE_EXTENSIONS = new Set([".cjs", ".css", ".html", ".js", ".json", ".map", ".mjs", ".svg", ".txt", ".xml"]);

export const getCrossPlatformSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const sizeInBytes = TEXT_FILE_EXTENSIONS.has(extname(absolutePath))
    ? Buffer.byteLength(readFileSync(absolutePath).toString("utf8").replaceAll("\r\n", "\n"), "utf8")
    : statSync(absolutePath).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  const standardizedName = basename(absolutePath);
  return `${standardizedName}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};
