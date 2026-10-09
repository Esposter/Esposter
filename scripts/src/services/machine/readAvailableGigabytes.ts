import { GIBIBYTE } from "#src/services/machine/constants";
import { parseVmStat } from "#src/services/machine/parseVmStat";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";
import { freemem } from "node:os";

// Free memory in gigabytes. Windows reports its free physical memory directly; macOS's figure leaves out what the
// System hands back on demand, so its available memory is read from `vm_stat`, and a failed read is none rather than guessed
export const readAvailableGigabytes = async (): Promise<number | undefined> => {
  if (process.platform !== "darwin") return freemem() / GIBIBYTE;
  return (await getResultAsync(async () => parseVmStat(await runMachineCommand("vm_stat", [])) / GIBIBYTE)).match(
    (gigabytes) => gigabytes,
    (error) => {
      console.error(error);
      return undefined;
    },
  );
};
