import { MAX_BUFFER_BYTES, OXFMT_BINARY_RELATIVE_PATH, OXFMT_CONFIGURATION_FILE } from "#src/services/shared/constants";
import { readFirstLine } from "#src/services/shared/readFirstLine";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { join } from "node:path";

// The repository's formatter runs from the main checkout, which holds its install, over the source on stdin. The path it
// Is given is the file's path in the repository: a worktree's own path sits under `.agents/worktrees`, which the config
// Ignores, so a file written from a worktree would pass through unformatted
export const formatSource = (source: string, relativePath: string, mainCheckoutRoot: string): string => {
  const { status, stderr, stdout } = spawnSync(
    process.execPath,
    [
      join(mainCheckoutRoot, OXFMT_BINARY_RELATIVE_PATH),
      "--config",
      join(mainCheckoutRoot, OXFMT_CONFIGURATION_FILE),
      "--stdin-filepath",
      relativePath,
    ],
    { cwd: mainCheckoutRoot, encoding: "utf8", input: source, maxBuffer: MAX_BUFFER_BYTES },
  );
  if (status !== 0) throw new InvalidOperationError(Operation.Read, relativePath, readFirstLine(stderr));
  return stdout;
};
