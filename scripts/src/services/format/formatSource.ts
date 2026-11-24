import { spawnFormatter } from "#src/services/format/spawnFormatter";
import { checkIsTimedOut } from "#src/services/shared/checkIsTimedOut";
import { CHILD_PROCESS_TIMEOUT_MS, OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { timedOutError } from "#src/services/shared/timedOutError";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The source a single file formats to, over its stdin, under its repository path, so the formatter applies the ignore
// Patterns and the parser that path names. The formatter matches its ignore patterns against the path it is given, and
// From the main checkout a worktree's `generated/` file would match none of them and be rewritten, which is why the
// Path is repository-relative. A file type the formatter has no parser for is undefined, not an error, since the
// Pre-commit hook skips it the same way. A formatter still running past its `timeout` throws naming the file and the
// Command
export const formatSource = (
  source: string,
  relativePath: string,
  repositoryRoot: string,
  mainCheckoutRoot: string,
  timeout: number = CHILD_PROCESS_TIMEOUT_MS,
): string | undefined => {
  const { error, status, stderr, stdout } = spawnFormatter(
    ["--stdin-filepath", relativePath],
    repositoryRoot,
    mainCheckoutRoot,
    timeout,
    source,
  );
  if (checkIsTimedOut(error))
    throw timedOutError(Operation.Read, relativePath, timeout, `oxfmt --stdin-filepath ${relativePath}`);
  if (status === 0) return stdout;
  if (stderr.includes(OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE)) return undefined;
  throw new InvalidOperationError(Operation.Read, relativePath, readFirstLine(stderr));
};
