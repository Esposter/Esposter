import { TEXT_FILE_EXTENSIONS } from "@/constants";
import { readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";

export const getCrossPlatformSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  const sizeInBytes = TEXT_FILE_EXTENSIONS.has(extname(absolutePath))
    ? Buffer.byteLength(
        readFileSync(absolutePath)
          .toString("utf8")
          .replaceAll("\r\n", "\n") // Windows to Unix
          .replaceAll("\r", "\n") // Old Mac to Unix
          .replaceAll(/\n+$/g, "\n") // Normalize trailing newlines
          .replaceAll(/\t/g, "  ") // Normalize tabs to spaces (if needed)
          .trimEnd() + "\n", // Ensure single trailing newline
        "utf8",
      )
    : statSync(absolutePath).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  const standardizedName = basename(absolutePath);
  return `${standardizedName}: ${sizeInKB} KB (${sizeInBytes} bytes)`;
};
