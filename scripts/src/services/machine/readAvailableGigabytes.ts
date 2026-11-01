import { GIBIBYTE } from "#src/services/machine/constants";
import { parseVmStat } from "#src/services/machine/parseVmStat";
import { readMemoryStatusGigabytes } from "#src/services/machine/readMemoryStatusGigabytes";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";
import { freemem } from "node:os";

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
