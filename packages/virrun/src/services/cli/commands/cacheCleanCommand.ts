import type { CleanArgs } from "@/models/cli/CleanArgs";
import type { ArgsDef, CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { getResult, toAppError } from "@esposter/shared";
import { defineCommand } from "citty";
import { join } from "node:path";
import process from "node:process";
// Explicit CleanArgs annotation (what isolatedDeclarations emits for the exported `CommandDef<CleanArgs>`; a
// Specific-args CommandDef is not assignable to the generic CommandDef) + `satisfies ArgsDef` to validate the
// Literal against citty's arg-definition shape.
const cleanArgs: CleanArgs = {
  all: { default: false, description: "Also remove the host-global ~/.virrun/snapshots.", type: "boolean" },
} satisfies ArgsDef;
// `virrun cache clean [--all]` — removes the repo-local `<root>/.virrun` cache (store; repopulated on the next
// Routed run). `--all` also clears the host-global `~/.virrun/snapshots`, which is shared across repos, so it is
// Opt-in. removeSnapshotDirectory is the safe teardown primitive (handles WSL-UNC paths + overlay-poisoned dirs,
// Harmless on a plain tree).
export const cacheCleanCommand: CommandDef<CleanArgs> = defineCommand({
  args: cleanArgs,
  meta: {
    description: "Remove the repo-local .virrun cache; --all also clears host-global warm snapshots.",
    name: CommandType.Clean,
  },
  run: ({ args }) => {
    getResult(() => {
      const repoCacheDirectory = getRepoCacheDirectory("");
      removeSnapshotDirectory(repoCacheDirectory);
      process.stderr.write(`[virrun] removed ${repoCacheDirectory}\n`);
      if (args.all) {
        const snapshotsPath = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
        removeSnapshotDirectory(snapshotsPath);
        process.stderr.write(`[virrun] removed ${snapshotsPath}\n`);
      }
    }).match(
      () => undefined,
      (error) => {
        process.stderr.write(`${toAppError(error).message}\n`);
        process.exitCode = 1;
      },
    );
  },
});
