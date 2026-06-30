import { BackendType } from "@/models/virrun/BackendType";
import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
import process from "node:process";
// Backs `virrun snapshot`: provisions the os backend's warm dependency snapshot for the current lockfile ahead of
// Time (the CI warm-up step, equivalent to `virrun -- true`) so the first real routed run reuses it instead of
// Paying the install. Only the os backend has an overlay snapshot layer, so on any other resolved backend this is a
// No-op that says so rather than silently doing nothing. Forking the `true` no-op triggers the cold-path capture
// (createVirrun → Virrun.fork): cold installs and freezes the snapshot, warm reuses it — either way `true` exits 0.
export const warmSnapshot = async (): Promise<number> => {
  const backend = resolveBackend(resolveVirrunConfiguration());
  if (backend !== BackendType.Os) {
    process.stderr.write(`[virrun] snapshot only applies to the os backend (current: ${backend})\n`);
    return 0;
  }
  const result = await getResultAsync(async () => {
    const virrun = await createVirrun({ backend });
    const { exists, hash } = resolveSnapshotLocation("");
    process.stderr.write(`${formatVirrunProvisioning({ exists, hash })}\n`);
    return withFinalizerAsync(
      () => virrun.fork(["true"], "inherit"),
      () => virrun.dispose(),
    );
  });
  return result.match(
    ({ exitCode }) => exitCode,
    (error) => {
      process.stderr.write(`${toAppError(error).message}\n`);
      return 1;
    },
  );
};
