import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { getWslRunsDirectory } from "#src/services/exec/wsl/getWslRunsDirectory";
import { getResult, noop } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Announce this run's WSL shell in the registry the startup sweep reads: an empty `<host pid>.<marker>` file, the
// Same pid-tagged shape every lease and overlay temp carries. Nothing releases it — a run that ends normally leaves
// Its entry behind and the next sweep reclaims it once this process is gone, exactly as a hard-killed one does, so
// There is no teardown path that can be skipped and no lifecycle hook to thread through the backend.
//
// Best-effort: a registry this run never got into only costs a corpse that a `cache clean` reclaims instead, which is
// Not worth failing a command over.
export const registerWslRun = (marker: string): void => {
  getResult(() => {
    const runsDirectory = getWslRunsDirectory();
    mkdirSync(runsDirectory, { recursive: true });
    writeFileSync(join(runsDirectory, `${process.pid}.${marker}`), "");
  }).match(noop, ({ message }) => {
    writeVirrunDebug(`run ${marker} not registered, a hard kill will leave its tree unreaped — ${message}`);
  });
};
