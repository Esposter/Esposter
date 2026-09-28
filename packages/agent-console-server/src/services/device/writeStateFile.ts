import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// `mode` applies only to a file the write creates, so the file is removed first rather than written into with whatever
// Permissions it was left
export const writeStateFile = (stateDirectory: string, filename: string, content: string): void => {
  const filePath = join(stateDirectory, filename);
  mkdirSync(stateDirectory, { recursive: true });
  rmSync(filePath, { force: true });
  writeFileSync(filePath, content, { mode: 0o600 });
};
