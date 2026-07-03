import { Color } from "@/models/cli/Color";
import { BackendType } from "@/models/virrun/BackendType";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
import { formatVirrunProvisioning } from "@/services/cli/format/formatVirrunProvisioning";
import { resolveBackend } from "@/services/configuration/resolveBackend";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createVirrun } from "@/services/virrun/createVirrun";
import { getResultAsync, toAppError, withFinalizerAsync } from "@esposter/shared";
// Backs `virrun snapshot`. Forking the `true` no-op triggers the cold-path capture (Virrun.fork): cold installs and
// Freezes the snapshot, warm reuses it — either way `true` exits 0, so the first real routed run pays nothing.
export const warmSnapshot = async (): Promise<number> => {
  const result = await getResultAsync(async () => {
    const configuration = resolveVirrunConfiguration();
    const backend = resolveBackend(configuration);
    if (backend !== BackendType.Os) {
      process.stderr.write(
        `${formatVirrunLine(`snapshot only applies to the os backend (current: ${colorize(backend, Color.Blue)})`)}\n`,
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
      process.stderr.write(`${formatVirrunLine(colorize(toAppError(error).message, Color.Red))}\n`);
      return 1;
    },
  );
};
