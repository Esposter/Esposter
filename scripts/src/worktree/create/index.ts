import { withInstallLock } from "#src/services/machine/withInstallLock";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { runCommand } from "#src/services/timing/runCommand";
import { timePhaseAsync } from "#src/services/timing/timePhaseAsync";
import { buildDistributions } from "#src/services/worktree/create/buildDistributions";
import { createWorktree } from "#src/services/worktree/create/createWorktree";
import { getBuildDirectories } from "#src/services/worktree/create/getBuildDirectories";
import { installWorktree } from "#src/services/worktree/create/installWorktree";
import { readMemoryGateShortfall } from "#src/services/worktree/create/readMemoryGateShortfall";
import { seedTaskCache } from "#src/services/worktree/create/seedTaskCache";
import { getResultAsync } from "@esposter/shared";
import { defineCommand } from "citty";

// `pnpm ai:worktree:create <name> [package...]` — a worktree on ai/queue, installed in full and built for the scripts package
// And the packages named. The free-memory gate is read first, so a shut gate creates nothing (the `throughput`
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
        "Create a worktree on ai/queue, installed in full and built for the scripts package and the packages named after the name, and print its full path; exits 4 with the shortfall while the memory gate is shut",
      name: "ai:worktree:create",
    },
    run: async ({ args }) => {
      const shortfall = await timePhaseAsync("memory gate", readMemoryGateShortfall);
      if (shortfall !== undefined) {
        console.info(shortfall);
        process.exitCode = 4;
        return;
      }
      const packageNames = args._.slice(1).map(String);
      const mainCheckoutRoot = readMainCheckoutRoot();
      const worktreePath = createWorktree(args.name, mainCheckoutRoot);
      // Under the machine's install lock, since every install writes the pnpm store that the others read and write. Its
      // Phase line counts the wait for the lock too, where the install line above it counts only the install
      await timePhaseAsync("install, lock wait included", () =>
        withInstallLock(() => {
          installWorktree(worktreePath);
        }),
      );
      // After the install, so the layout the copy matches is the installed one, and before the builds, which replay from
      // It. A seed that fails costs the builds their replays, never the create
      const buildDirectories = getBuildDirectories(readWorkspacePackages(worktreePath), packageNames);
      (
        await timePhaseAsync("seed task cache", () =>
          getResultAsync(() => seedTaskCache(mainCheckoutRoot, worktreePath, buildDirectories)),
        )
      ).match(
        (seededFrom) => {
          if (seededFrom !== undefined) console.error(`task cache seeded from ${seededFrom}`);
        },
        (error) => {
          console.error(`task cache not seeded: ${error.message}`);
        },
      );
      buildDistributions(worktreePath, buildDirectories);
      console.info(worktreePath);
    },
  }),
);
