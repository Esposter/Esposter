import { runCommand } from "#src/services/timing/runCommand";
import { removeWorktree } from "#src/services/worktree/remove/removeWorktree";
import { defineCommand } from "citty";

// `pnpm ai:worktree:remove <path>` — removes a linked worktree and its branch once that has landed, or a folder under the
// worktrees folder git no longer lists; the full path only (the `throughput` skill, `references/fleet.md`)
await runCommand(
  defineCommand({
    args: { path: { description: "The worktree's full path", required: true, type: "positional" } },
    meta: {
      description:
        "Remove a worktree, its branch once landed, and any Windows junctions and loaded binaries in its way",
      name: "ai:worktree:remove",
    },
    run: ({ args }) => {
      removeWorktree(args.path);
      console.info(`removed ${args.path}`);
    },
  }),
);
