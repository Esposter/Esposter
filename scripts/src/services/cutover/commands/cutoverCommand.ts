import { assignIdsCommand } from "#src/services/cutover/commands/assignIdsCommand";
import { copyCoreCommand } from "#src/services/cutover/commands/copyCoreCommand";
import { copyObjectsCommand } from "#src/services/cutover/commands/copyObjectsCommand";
import { copyTablesCommand } from "#src/services/cutover/commands/copyTablesCommand";
import { inventoryCommand } from "#src/services/cutover/commands/inventoryCommand";
import { rescheduleCommand } from "#src/services/cutover/commands/rescheduleCommand";
import { rewriteUrlsCommand } from "#src/services/cutover/commands/rewriteUrlsCommand";
import { snapshotCommand } from "#src/services/cutover/commands/snapshotCommand";
import { verifyCommand } from "#src/services/cutover/commands/verifyCommand";
import { defineCommand } from "citty";

// `pnpm -C scripts cutover <step> --environment <develop|production>` — the Railway, Azure and Namecheap data move. Temporary:
// the command is deleted at teardown (openspec/changes/infra-cloudflare-cutover/design.md)
export const cutoverCommand = defineCommand({
  meta: {
    description:
      "Move the Railway and Azure data onto Cloudflare, each step idempotent with a checkpoint in the archive bucket. Live, in order: snapshot, assign-ids, copy-objects, copy-core, copy-tables. Freeze, in order: assign-ids, copy-objects --delta, copy-core, copy-tables --delta, rewrite-urls, reschedule, verify",
    name: "cutover",
  },
  subCommands: {
    "assign-ids": assignIdsCommand,
    "copy-core": copyCoreCommand,
    "copy-objects": copyObjectsCommand,
    "copy-tables": copyTablesCommand,
    inventory: inventoryCommand,
    reschedule: rescheduleCommand,
    "rewrite-urls": rewriteUrlsCommand,
    snapshot: snapshotCommand,
    verify: verifyCommand,
  },
});
