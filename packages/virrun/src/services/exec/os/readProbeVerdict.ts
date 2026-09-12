import { ExecFileError } from "#src/models/exec/util/ExecFileError";
import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { getResult } from "@esposter/shared";
// Runs one host-capability attempt and grades it. A completed attempt is a verdict either way; an attempt whose child
// Was KILLED is not — the only thing that kills one here is its own timeout, and a bound elapsing says nothing about
// Whether bwrap can mount an overlay. That case answers `undefined` ("not answered") rather than false, so the caller
// Degrades this run to native without persisting a stall as a capability fact for the cache's whole window
// (checkIsOsBackendSupported). Both failure shapes trace, since a run that silently went native is the symptom either way.
export const readProbeVerdict = (probe: () => void): boolean | undefined =>
  getResult(probe).match(
    () => true,
    (error) => {
      const isKilled = error instanceof ExecFileError && Boolean(error.signal);
      writeVirrunDebug(
        `os capability probe ${isKilled ? "timed out — verdict not cached" : "failed"} — ${error.message}`,
      );
      return isKilled ? undefined : false;
    },
  );
