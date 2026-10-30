import {
  MAX_BUFFER_BYTES,
  OXFMT_BINARY_RELATIVE_PATH,
  OXFMT_CONFIGURATION_FILE,
  OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE,
} from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { join } from "node:path";

// The repository's formatter binary runs from the main checkout, which holds its install, over the source on stdin. The
// Configuration and the working directory are both the checkout the file is in, since the formatter matches its ignore
// Patterns against the path it is given from the working directory: from the main checkout, a worktree's `generated/` file
// would match none of them and be rewritten. The path is repository-relative, since a worktree's own path sits under
// `.agents/worktrees`, which the config ignores. A file type the formatter has no parser for is undefined, not an error,
// Since the pre-commit hook skips it the same way
export const formatSource = (
  source: string,
  relativePath: string,
  repositoryRoot: string,
  mainCheckoutRoot: string,
): string | undefined => {
  const { status, stderr, stdout } = spawnSync(
    process.execPath,
    [
      join(mainCheckoutRoot, OXFMT_BINARY_RELATIVE_PATH),
      "--config",
      join(repositoryRoot, OXFMT_CONFIGURATION_FILE),
      "--stdin-filepath",
      relativePath,
    ],
    { cwd: repositoryRoot, encoding: "utf8", input: source, maxBuffer: MAX_BUFFER_BYTES },
  );
  if (status === 0) return stdout;
  if (stderr.includes(OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE)) return undefined;
  throw new InvalidOperationError(Operation.Read, relativePath, readFirstLine(stderr));
};
