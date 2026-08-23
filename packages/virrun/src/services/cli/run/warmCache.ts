import { Color } from "#src/models/cli/Color";
import { BackendType } from "#src/models/virrun/BackendType";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunError } from "#src/services/cli/format/formatVirrunError";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
import { formatVirrunProvisioning } from "#src/services/cli/format/formatVirrunProvisioning";
import { resolveBackend } from "#src/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "#src/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "#src/services/virrun/createVirrun";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";
// Backs `virrun warm`. Forking the `true` no-op triggers the cold-path capture (Virrun.fork): cold installs and
// Freezes the snapshot, warm reuses it — either way `true` exits 0, so the first real routed run pays nothing.
export const warmCache = async (): Promise<number> => {
  const result = await getResultAsync(async () => {
    const configuration = resolveVirrunConfiguration();
    const backend = resolveBackend(configuration);
    if (backend !== BackendType.Os) {
      process.stderr.write(
        `${formatVirrunLine(`the warm cache only applies to the os backend (current: ${colorize(backend, Color.Blue)})`)}\n`,
      );
      return { exitCode: 0 };
    }
    const virrun = await createVirrun({ backend, environment: configuration?.environment });
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
      process.stderr.write(`${formatVirrunError(error.message)}\n`);
      return 1;
    },
  );
};
