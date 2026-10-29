import { MAX_BUFFER_BYTES, OXFMT_BINARY_RELATIVE_PATH, OXFMT_CONFIGURATION_PATH } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { join } from "node:path";

// The repository's formatter binary runs from the main checkout, which holds its install, over the source on stdin. Its
// Configuration is the checkout the file is in, as CI reads it, so a configuration change in a worktree applies to the
// Files changed there. The path it is given is the file's path in the repository: a worktree's own path sits under
// `.agents/worktrees`, which the config ignores, so a file written from a worktree would pass through unformatted
export const formatSource = (source: string, relativePath: string, mainCheckoutRoot: string): string => {
  const { status, stderr, stdout } = spawnSync(
    process.execPath,
    [
      join(mainCheckoutRoot, OXFMT_BINARY_RELATIVE_PATH),
      "--config",
      OXFMT_CONFIGURATION_PATH,
      "--stdin-filepath",
      relativePath,
    ],
    { cwd: mainCheckoutRoot, encoding: "utf8", input: source, maxBuffer: MAX_BUFFER_BYTES },
  );
  if (status !== 0) throw new InvalidOperationError(Operation.Read, relativePath, readFirstLine(stderr));
  return stdout;
};
