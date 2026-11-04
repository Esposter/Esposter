import { statSync } from "node:fs";
import { resolve } from "node:path";

export const getFileSize = (targetPath: string): number => statSync(resolve(targetPath)).size;
