import { GENERATED_JSON_EXTENSION, JSON_INDENT } from "#src/services/voiceMatch/constants";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One generated record to its own file, written as the stage goes so a run that dies late keeps what it measured
export const writeGeneratedJson = (directory: string, fileName: string, value: unknown): void => {
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, `${fileName}${GENERATED_JSON_EXTENSION}`),
    JSON.stringify(value, undefined, JSON_INDENT),
  );
};
