import { REPAIR_VERIFY_COMMANDS } from "#src/services/coderabbit/collect/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// The checks a repair earns before it reaches `main`, run on the checkout as it stands: whether the regenerators
// Answered the red they were handed (`repairMechanically`), and whether a session's repair did.
export const checkIsGreen = (cwd: string): boolean =>
  REPAIR_VERIFY_COMMANDS.every((args) => {
    console.info(`verify: pnpm ${args.join(" ")}`);
    return spawnPnpm(args, { cwd, stdio: "inherit" }).status === 0;
  });
