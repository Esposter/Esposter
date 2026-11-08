import { GIBIBYTE } from "#src/services/machine/constants";
import { parseMemoryStatusLevel } from "#src/services/machine/parseMemoryStatusLevel";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { SYSCTL_PATH } from "#src/services/shared/constants";
import { getResultAsync } from "@esposter/shared";
import { totalmem } from "node:os";

// MacOS's own pressure figure, the share of memory it counts as available, read as a share of the machine's total RAM.
// A failed read is logged and gives undefined, so the caller falls back to `vm_stat`
export const readMemoryStatusGigabytes = async (): Promise<number | undefined> =>
  (
    await getResultAsync(async () =>
      parseMemoryStatusLevel(await runMachineCommand(SYSCTL_PATH, ["-n", "kern.memorystatus_level"])),
    )
  ).match(
    (share) => (totalmem() / GIBIBYTE) * share,
    (error) => {
      console.error(error);
      return undefined;
    },
  );
