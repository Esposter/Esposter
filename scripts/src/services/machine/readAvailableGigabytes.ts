import { GIBIBYTE } from "#src/services/machine/constants";
import { parseVmStat } from "#src/services/machine/parseVmStat";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";
import { freemem } from "node:os";

// Free memory in gigabytes. Windows reports its free physical memory directly; macOS's figure leaves out what the
// System hands back on demand, so its available memory is read from `vm_stat`, and a failed read is thrown rather than guessed
export const readAvailableGigabytes = async (): Promise<number> => {
  if (process.platform !== "darwin") return freemem() / GIBIBYTE;
  return (await getResultAsync(() => runMachineCommand("vm_stat", []))).match(
    (output) => parseVmStat(output) / GIBIBYTE,
    (error) => {
      throw error;
    },
  );
};
