import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// Run a lane's checks against the candidate in `cwd` and say whether it is green. Which checks those are is the
// Lane's decision, not this one's — `VERIFY_COMMANDS` for a window a reviewer will read, and the express lane's
// Longer list for a cut that reaches `main` unread.
export const verifyCandidate = (commands: string[][], cwd: string): boolean =>
  commands.every((args) => {
    console.info(`verify: pnpm ${args.join(" ")}`);
    return spawnPnpm(args, { cwd, stdio: "inherit" }).status === 0;
  });
