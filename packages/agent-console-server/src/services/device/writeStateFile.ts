import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Written to a file of its own and renamed over the old one, so a host stopped mid-write leaves the old file whole rather
// Than none, and `mode` applies because the write always creates the file
export const writeStateFile = (stateDirectory: string, filename: string, content: string): void => {
  const filePath = join(stateDirectory, filename);
  const temporaryFilePath = `${filePath}.${crypto.randomUUID()}.tmp`;
  mkdirSync(stateDirectory, { recursive: true });
  writeFileSync(temporaryFilePath, content, { flag: "wx", mode: 0o600 });
  renameSync(temporaryFilePath, filePath);
};
