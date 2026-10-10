import {
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_PATH,
  OXFMT_CONFIGURATION_PATH,
  REPOSITORY_ROOT,
} from "#src/services/shared/constants";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Writes a value as JSON the repository's formatter would commit: indented as `JSON.stringify` indents, then formatted by
// The formatter's own binary under its own configuration, for this path, so a re-run with unchanged data rewrites nothing
export const writeJsonFile = (path: string, value: unknown): void => {
  const formatted = execFileSync(
    process.execPath,
    [OXFMT_BINARY_PATH, `--config=${OXFMT_CONFIGURATION_PATH}`, `--stdin-filepath=${path}`],
    {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      input: `${JSON.stringify(value, undefined, 2)}\n`,
      maxBuffer: MAX_BUFFER_BYTES,
    },
  );
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, formatted);
};
