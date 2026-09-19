import { EXPRESS_VERIFY_COMMANDS } from "#src/services/coderabbit/collect/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// The checks a commit earns before it reaches `main` unread, run on the checkout as it stands. Two callers, one
// Meaning: the express lane's gate on a cut nobody reviewed, and what tells the repairer whether the regenerators
// Answered the red it was handed (`repairMechanically`) — which is the same question, asked before the push
// Rather than after.
export const checkIsGreen = (cwd: string): boolean =>
  EXPRESS_VERIFY_COMMANDS.every((args) => {
    console.info(`verify: pnpm ${args.join(" ")}`);
    return spawnPnpm(args, { cwd, stdio: "inherit" }).status === 0;
  });
