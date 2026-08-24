import { formatByteSize } from "#src/formatByteSize";
import { statSync } from "node:fs";
import { resolve } from "node:path";

export const getFileSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  return formatByteSize(absolutePath, statSync(absolutePath).size);
};
