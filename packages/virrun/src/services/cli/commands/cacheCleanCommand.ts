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
// Explicit annotation for isolatedDeclarations + `satisfies ArgsDef` to validate the literal.
const cleanArgs: CleanArgs = {
  all: { default: false, description: "Also remove the host-global ~/.virrun/snapshots.", type: "boolean" },
} satisfies ArgsDef;
// `--all` also clears the host-global snapshots, which are shared across repos, so it is opt-in.
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
