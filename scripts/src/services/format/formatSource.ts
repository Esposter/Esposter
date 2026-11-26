import { checkIsComponentPath } from "#src/services/format/checkIsComponentPath";
import { spawnFormatter } from "#src/services/format/spawnFormatter";
import {
  CHILD_PROCESS_TIMEOUT_MS,
  OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE,
  VITE_CONFIGURATION_FILE,
} from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";
import { formatSync } from "vize";

// The source a single file formats to, over its stdin, under its repository path, so the formatter applies the ignore
// Patterns and the parser that path names. The formatter matches its ignore patterns against the path it is given, and
// From the main checkout a worktree's `generated/` file would match none of them and be rewritten, which is why the
// Path is repository-relative. A file type the formatter has no parser for is undefined, not an error, since the
// Pre-commit hook skips it the same way. A formatter still running past its `timeout` throws naming the file and the
// Command. A component is vize's, formatted in process since its command line reads no stdin, under the checkout's
// Unified config, named since the nearest one to a component in an app is that app's Vitest config
export const formatSource = (
  source: string,
  relativePath: string,
  repositoryRoot: string,
  mainCheckoutRoot: string,
  timeout: number = CHILD_PROCESS_TIMEOUT_MS,
): string | undefined => {
  if (checkIsComponentPath(relativePath))
    return formatSync(source, {
      config: join(repositoryRoot, VITE_CONFIGURATION_FILE),
      filename: join(repositoryRoot, relativePath),
    }).code;
  const { status, stderr, stdout } = spawnFormatter(
    ["--stdin-filepath", relativePath],
    repositoryRoot,
    mainCheckoutRoot,
    {
      command: `oxfmt --stdin-filepath ${relativePath}`,
      input: source,
      name: relativePath,
      operation: Operation.Read,
      timeout,
    },
  );
  if (status === 0) return stdout;
  if (stderr.includes(OXFMT_UNSUPPORTED_FILE_TYPE_MESSAGE)) return undefined;
  throw new InvalidOperationError(Operation.Read, relativePath, readFirstLine(stderr));
};
