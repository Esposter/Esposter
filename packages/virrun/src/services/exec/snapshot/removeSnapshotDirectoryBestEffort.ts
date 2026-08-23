import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { removeSnapshotDirectory } from "#src/services/exec/snapshot/removeSnapshotDirectory";
import { getResult, noop } from "@esposter/shared";
// Teardown of a temp THIS invocation owns: never throws. Every such removal is housekeeping rather than correctness —
// The pid-tagged temp convention exists precisely so a corpse left behind is reclaimed later (reapStaleTemps,
// PruneStaleSnapshots) — while a throw costs the run one of two ways. On the success path it discards work that
// Already completed and published (a captured layer, a flushed run). On the failure path it runs inside the finalizer
// And REPLACES the error that actually failed the run: a WSL service that dies mid-run surfaces as nothing but
// "Command failed: wsl.exe … rm -rf", with the real cause thrown away. The removal is still attempted synchronously
// (a caller ordering a publish after it keeps its ordering); only its verdict is dropped, to the debug sink.
export const removeSnapshotDirectoryBestEffort = (dir: string): void => {
  getResult(() => {
    removeSnapshotDirectory(dir);
  }).match(noop, (error) => {
    writeVirrunDebug(`snapshot temp teardown failed (${dir}) — ${error.message}`);
  });
};
