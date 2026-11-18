import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { runCommand } from "#src/services/timing/runCommand";
import { buildDistributions } from "#src/services/worktree/create/buildDistributions";
import { copyEslintConfiguration } from "#src/services/worktree/create/copyEslintConfiguration";
import { createWorktree } from "#src/services/worktree/create/createWorktree";
import { installWorktree } from "#src/services/worktree/create/installWorktree";
import { readBuildDirectories } from "#src/services/worktree/create/readBuildDirectories";
import { readMemoryGateShortfall } from "#src/services/worktree/create/readMemoryGateShortfall";
import { defineCommand } from "citty";

// `pnpm ai:worktree:create <name> [package...]` — a worktree on ai/queue, installed for the scripts package and the packages
// Named, and built beside them. The free-memory gate is read first, so a shut gate creates nothing (the `throughput`
// Skill, `references/machine-efficiency.md`)
await runCommand(
  defineCommand({
    args: {
      name: {
        description: "The worktree's folder name under .agents/worktrees, which is also its branch's name",
        required: true,
        type: "positional",
      },
    },
    meta: {
      description:
        "Create a worktree on ai/queue, installed for the scripts package and the packages named after the name, and print its full path; exits 4 with the shortfall while the memory gate is shut",
      name: "ai:worktree:create",
    },
    run: async ({ args }) => {
      const shortfall = await readMemoryGateShortfall();
      if (shortfall !== undefined) {
        console.info(shortfall);
        process.exitCode = 4;
        return;
      }
      const packageNames = args._.slice(1).map(String);
      const mainCheckoutRoot = readMainCheckoutRoot();
      const worktreePath = createWorktree(args.name, mainCheckoutRoot);
      installWorktree(worktreePath, packageNames);
      buildDistributions(worktreePath, readBuildDirectories(worktreePath, packageNames));
      // Last, since an install prunes whatever it did not select, and the copied file imports packages it did
      copyEslintConfiguration(mainCheckoutRoot, worktreePath);
      console.info(worktreePath);
    },
  }),
);
