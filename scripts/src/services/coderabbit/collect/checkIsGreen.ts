import { REPAIR_VERIFY_COMMANDS, REPAIR_VERIFY_TIMEOUT_MS } from "#src/services/coderabbit/collect/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// The checks a repair earns before it reaches `main`, run on the checkout as it stands: whether the regenerators
// Answered the red they were handed (`repairMechanically`), and whether a session's repair did. The suite runs on a
// Clock of its own (`REPAIR_VERIFY_TIMEOUT_MS`) started at its first check, so nothing before it — a session that used
// Most of its own — shortens it, and one the clock cuts short is a red: a check is never started once it has run
// Out, since a `timeout` of nothing is no timeout at all to `spawnSync`.
export const checkIsGreen = (cwd: string): boolean => {
  const deadlineMs = Date.now() + REPAIR_VERIFY_TIMEOUT_MS;
  return REPAIR_VERIFY_COMMANDS.every((args) => {
    const timeout = deadlineMs - Date.now();
    if (timeout <= 0) {
      console.info(`verify: the suite's clock ran out before pnpm ${args.join(" ")}`);
      return false;
    }

    console.info(`verify: pnpm ${args.join(" ")}`);
    return spawnPnpm(args, { cwd, stdio: "inherit", timeout }).status === 0;
  });
};
