import { JSON_INDENT } from "#src/services/voiceMatch/constants";
import { getGeneratedFileName } from "#src/services/voiceMatch/getGeneratedFileName";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One generated record to its own file, written as the stage goes so a run that dies late keeps what it measured
export const writeGeneratedJson = (directory: string, name: string, value: unknown): void => {
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, getGeneratedFileName(name)), JSON.stringify(value, undefined, JSON_INDENT));
};
