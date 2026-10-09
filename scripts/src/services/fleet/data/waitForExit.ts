import type { ChildProcess } from "node:child_process";

import { FAILURE_EXIT_CODE } from "#src/services/fleet/data/constants";

// The child's exit code, resolved rather than rejected so an early exit never leaves an unhandled rejection behind;
// A child that fails to start resolves to the failure code. Attach it before the child's streams are read
export const waitForExit = (child: ChildProcess): Promise<number> =>
  new Promise((resolve) => {
    child.once("error", () => resolve(FAILURE_EXIT_CODE));
    child.once("close", (code) => resolve(code ?? FAILURE_EXIT_CODE));
  });
