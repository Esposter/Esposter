import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { formatResumeRows } from "#src/services/resume/formatResumeRows";
import { getHoldItems } from "#src/services/resume/getHoldItems";
import { readClaimItems } from "#src/services/resume/readClaimItems";
import { readCollectorItems } from "#src/services/resume/readCollectorItems";
import { readHoldFiles } from "#src/services/resume/readHoldFiles";
import { readPluginItems } from "#src/services/resume/readPluginItems";
import { readQueueItems } from "#src/services/resume/readQueueItems";
import { readResumeRow } from "#src/services/resume/readResumeRow";
import { readTreeItems } from "#src/services/resume/readTreeItems";
import { readWorktreeItems } from "#src/services/resume/readWorktreeItems";
import { getResult } from "@esposter/shared";
import { defineCommand, runMain } from "citty";

// `pnpm ai:resume` — what this machine still owes, one row per check, each with its action (the resuming skill). The
// Rows that spawn git or gh start first, so the synchronous fleet reads run while they are in flight
await runMain(
  defineCommand({
    meta: {
      description: "Print this machine's leftovers, each with its action; exits 1 when any needs one",
      name: "resume",
    },
    run: async () => {
      const tree = readResumeRow("tree", readTreeItems);
      const queue = readResumeRow("queue", readQueueItems);
      const worktrees = readResumeRow("worktrees", readWorktreeItems);
      const claimedRefs = getResult(() => readClaimedRefs());
      const requireClaimedRefs = () =>
        claimedRefs.match(
          (claimedRefMap) => claimedRefMap,
          (error) => {
            throw error;
          },
        );
      const collector = readResumeRow("collector", readCollectorItems);
      const rows = await Promise.all([
        tree,
        queue,
        worktrees,
        readResumeRow("claims", () => readClaimItems(requireClaimedRefs())),
        readResumeRow("holds", () => getHoldItems(readHoldFiles(), requireClaimedRefs())),
        readResumeRow("plugins", readPluginItems),
        collector,
      ]);
      for (const line of formatResumeRows(rows)) console.info(line);
      if (rows.some(({ items }) => items.some(({ action }) => action !== ""))) process.exitCode = 1;
    },
  }),
);
