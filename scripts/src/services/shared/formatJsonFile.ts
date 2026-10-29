import {
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_PATH,
  OXFMT_CONFIGURATION_PATH,
  REPOSITORY_ROOT,
} from "#src/services/shared/constants";
import { execFileSync } from "@esposter/shared-node/child-process";

// The text the repository's formatter commits for a value at a path: indented as `JSON.stringify` indents, then formatted by
// The formatter's own binary under its own configuration, for this path, so a value the formatter leaves as it is comes back
// Unchanged
export const formatJsonFile = (path: string, value: unknown): string =>
  execFileSync(
    process.execPath,
    [OXFMT_BINARY_PATH, `--config=${OXFMT_CONFIGURATION_PATH}`, `--stdin-filepath=${path}`],
    {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      input: `${JSON.stringify(value, undefined, 2)}\n`,
      maxBuffer: MAX_BUFFER_BYTES,
    },
  );
