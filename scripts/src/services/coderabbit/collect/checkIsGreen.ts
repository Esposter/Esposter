import { REPAIR_VERIFY_COMMANDS } from "#src/services/coderabbit/collect/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// The checks a repair earns before it reaches `main`, run on the checkout as it stands: whether the regenerators
// Answered the red they were handed (`repairMechanically`), and whether a session's repair did. Each runs inside the
// Attempt's deadline (`REPAIR_ATTEMPT_TIMEOUT_MS`), and one the deadline cuts short is a red: a check never started
// Once it has passed, since a `timeout` of nothing is no timeout at all to `spawnSync`.
export const checkIsGreen = (cwd: string, deadlineMs: number): boolean =>
  REPAIR_VERIFY_COMMANDS.every((args) => {
    const timeout = deadlineMs - Date.now();
    if (timeout <= 0) {
      console.info(`verify: the attempt's deadline passed before pnpm ${args.join(" ")}`);
      return false;
    }

    console.info(`verify: pnpm ${args.join(" ")}`);
    return spawnPnpm(args, { cwd, stdio: "inherit", timeout }).status === 0;
  });
