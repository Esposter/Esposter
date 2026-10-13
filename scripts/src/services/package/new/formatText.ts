import {
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_PATH,
  OXFMT_CONFIGURATION_PATH,
  REPOSITORY_ROOT,
} from "#src/services/shared/constants";
import { execFileSync } from "@esposter/shared-node/child-process";

// Formats a generated or edited file the way the pre-commit hook would, under the repository's own configuration.
// The path is repository-relative: the formatter decides what to ignore from it, and a temporary root would read as outside
export const formatText = (relativePath: string, text: string): string =>
  execFileSync(
    process.execPath,
    [OXFMT_BINARY_PATH, `--config=${OXFMT_CONFIGURATION_PATH}`, `--stdin-filepath=${relativePath}`],
    { cwd: REPOSITORY_ROOT, encoding: "utf8", input: text, maxBuffer: MAX_BUFFER_BYTES },
  );
