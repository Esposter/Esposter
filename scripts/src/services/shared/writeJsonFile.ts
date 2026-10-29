import { formatJsonFile } from "#src/services/shared/formatJsonFile";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Writes a value as JSON the repository's formatter would commit, so a re-run with unchanged data rewrites nothing
export const writeJsonFile = (path: string, value: unknown): void => {
  const formatted = formatJsonFile(path, value);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, formatted);
};
