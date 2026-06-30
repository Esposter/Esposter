import { BackendType } from "@/models/virrun/BackendType";
import { formatVirrunProvisioning } from "@/services/cli/formatVirrunProvisioning";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
import process from "node:process";
// Backs `virrun snapshot`. Forking the `true` no-op triggers the cold-path capture (Virrun.fork): cold installs and
// Freezes the snapshot, warm reuses it — either way `true` exits 0, so the first real routed run pays nothing.
export const warmSnapshot = async (): Promise<number> => {
  const result = await getResultAsync(async () => {
    const backend = resolveBackend(resolveVirrunConfiguration());
    if (backend !== BackendType.Os) {
      process.stderr.write(`[virrun] snapshot only applies to the os backend (current: ${backend})\n`);
      return { exitCode: 0 };
    }
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
