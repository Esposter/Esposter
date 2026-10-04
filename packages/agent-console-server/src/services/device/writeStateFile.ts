import { getResult, noop } from "@esposter/shared";
import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Written to a file of its own and renamed over the old one, so a host stopped mid-write leaves the old file whole
// Rather than none, and `mode` applies because the write always creates the file. A write that fails removes its own
// File, so retries leave no trail of them behind
export const writeStateFile = (stateDirectory: string, filename: string, content: string): void => {
  const filePath = join(stateDirectory, filename);
  const temporaryFilePath = `${filePath}.${crypto.randomUUID()}.tmp`;
  mkdirSync(stateDirectory, { recursive: true });
  getResult(() => {
    writeFileSync(temporaryFilePath, content, { flag: "wx", mode: 0o600 });
    renameSync(temporaryFilePath, filePath);
  }).match(noop, (error) => {
    // A removal that fails too is logged, so the error the caller sees stays the write's own
    getResult(() => {
      rmSync(temporaryFilePath, { force: true });
    }).match(noop, console.error);
    throw error;
  });
};
