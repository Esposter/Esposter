import {
  FAILED_LOG_TAIL_LINES,
  INSTALL_COMMAND,
  INSTALL_OUTPUT_MAX_BUFFER_BYTES,
} from "#src/services/coderabbit/collect/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { ANSI_ESCAPE_REGEX } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// The install a session's checks run against, on the tree it was switched to. A failed one is that tree's red —
// A stale lockfile, a postinstall a commit broke — and red trees are what the sessions are for, so its tail is
// Returned for the prompt rather than thrown: a throw here counted no attempt, and every run retried it red.
export const runInstall = (cwd: string): string | undefined => {
  const { status, stderr, stdout } = spawnPnpm(INSTALL_COMMAND, {
    cwd,
    maxBuffer: INSTALL_OUTPUT_MAX_BUFFER_BYTES,
    stdio: "pipe",
  });
  if (status === 0) return undefined;

  const lines = getNonEmptyLines(`${stdout}\n${stderr}`.replaceAll(ANSI_ESCAPE_REGEX, ""));
  const failure = lines.slice(-FAILED_LOG_TAIL_LINES).join("\n");
  console.info(`pnpm ${INSTALL_COMMAND.join(" ")} failed:\n${failure}`);
  return failure;
};
