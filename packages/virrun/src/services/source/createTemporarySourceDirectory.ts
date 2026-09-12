import type { LoadedSource } from "#src/models/source/LoadedSource";

import { VIRRUN_TEMP_DIR_PREFIX } from "#src/services/exec/util/constants";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
// The working dir a materialized source (a file map, a git clone) is written into, with the teardown that removes
// It: a fresh `os.tmpdir()` sibling under the virrun prefix, so a loader that dies mid-write can dispose exactly
// What it created.
export const createTemporarySourceDirectory = async (): Promise<LoadedSource> => {
  const cwd = await mkdtemp(join(tmpdir(), VIRRUN_TEMP_DIR_PREFIX));
  return { cwd, dispose: () => rm(cwd, { force: true, recursive: true }) };
};
