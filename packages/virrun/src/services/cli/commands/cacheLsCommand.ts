import type { CommandDef } from "citty";

import { formatCacheListing } from "@/services/cli/formatCacheListing";
import { VIRRUN_SNAPSHOTS_DIRECTORY_NAME } from "@/services/exec/snapshot/constants";
import { VIRRUN_STORE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { getResult, toAppError } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
// `virrun cache ls` — reports the two on-disk caches: the repo-local dep store (`<root>/.virrun/store`) and the
// Host-global warm-snapshot dir (`~/.virrun/snapshots`, one `<lockfile-hash>` entry per captured snapshot). The IO
// (existence + dir read) lives here; the rendering is the pure formatCacheListing. Resolving the repo store needs a
// Lockfile, so run outside a repo surfaces as a clean error line and exit 1 rather than an uncaught stack trace.
export const cacheLsCommand: CommandDef = defineCommand({
  meta: {
    description: "List the repo-local dependency store and host-global warm snapshots.",
    name: "ls",
  },
  run: () => {
    getResult(() => {
      const repoStorePath = join(getRepoCacheDirectory(""), VIRRUN_STORE_DIRECTORY_NAME);
      const snapshotsPath = join(getGlobalCacheDirectory(), VIRRUN_SNAPSHOTS_DIRECTORY_NAME);
      const snapshotHashes = existsSync(snapshotsPath) ? readdirSync(snapshotsPath).toSorted() : [];
      return formatCacheListing({
        isRepoStorePresent: existsSync(repoStorePath),
        repoStorePath,
        snapshotHashes,
        snapshotsPath,
      });
    }).match(
      (listing) => process.stderr.write(`${listing}\n`),
      (error) => {
        process.stderr.write(`${toAppError(error).message}\n`);
        process.exitCode = 1;
      },
    );
  },
});
