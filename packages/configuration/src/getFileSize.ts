import { statSync } from "node:fs";
import { resolve } from "node:path";

import { formatByteSize } from "./formatByteSize";

export const getFileSize = (targetPath: string): string => {
  const absolutePath = resolve(targetPath);
  return formatByteSize(absolutePath, statSync(absolutePath).size);
};
