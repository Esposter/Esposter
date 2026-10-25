import { globSync } from "node:fs";
import { join } from "node:path";

export const findExecutable = (directory: string, executablePattern: string): string | undefined => {
  const [held] = globSync(executablePattern, { cwd: directory });
  return held ? join(directory, held) : undefined;
};
