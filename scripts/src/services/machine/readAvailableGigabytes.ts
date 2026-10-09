import { GIBIBYTE } from "#src/services/machine/constants";
import { parseMemoryStatusLevel } from "#src/services/machine/parseMemoryStatusLevel";
import { parseVmStat } from "#src/services/machine/parseVmStat";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";
import { freemem, totalmem } from "node:os";

// MacOS's own pressure figure, the share of memory it counts as available, read as a share of the machine's total RAM.
// A failed read is logged and gives undefined, so the caller falls back to `vm_stat`
const readMemoryStatusGigabytes = async (): Promise<number | undefined> =>
  (
    await getResultAsync(async () =>
      parseMemoryStatusLevel(await runMachineCommand("sysctl", ["-n", "kern.memorystatus_level"])),
    )
  ).match(
    (share) => (totalmem() / GIBIBYTE) * share,
    (error) => {
      console.error(error);
      return undefined;
    },
  );

// Available memory in gigabytes. Windows reports its free physical memory directly. macOS's free figure leaves out what the
// System hands back on demand, so its available memory is the kernel's pressure figure, with `vm_stat` as the fallback,
// And a failed fallback is none rather than guessed
export const readAvailableGigabytes = async (): Promise<number | undefined> => {
  if (process.platform !== "darwin") return freemem() / GIBIBYTE;
  const memoryStatusGigabytes = await readMemoryStatusGigabytes();
  if (memoryStatusGigabytes !== undefined) return memoryStatusGigabytes;
  return (await getResultAsync(async () => parseVmStat(await runMachineCommand("vm_stat", [])) / GIBIBYTE)).match(
    (gigabytes) => gigabytes,
    (error) => {
      console.error(error);
      return undefined;
    },
  );
};
