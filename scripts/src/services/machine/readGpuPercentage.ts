import { parseIoregDeviceUtilization } from "#src/services/machine/parseIoregDeviceUtilization";
import { parseTypeperf } from "#src/services/machine/parseTypeperf";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";

// The GPU 3D utilisation of the one adapter a platform reads, or none where no reader exists or the read failed
export const readGpuPercentage = async (): Promise<number | undefined> => {
  switch (process.platform) {
    case "darwin":
      return (
        await getResultAsync(() => runMachineCommand("ioreg", ["-r", "-d", "1", "-w", "0", "-c", "IOAccelerator"]))
      ).match(parseIoregDeviceUtilization, (error) => {
        console.error(error);
        return undefined;
      });
    case "win32":
      return (
        await getResultAsync(() =>
          runMachineCommand("typeperf", ["\\GPU Engine(*engtype_3D)\\Utilization Percentage", "-sc", "1"]),
        )
      ).match(parseTypeperf, (error) => {
        console.error(error);
        return undefined;
      });
    default:
      return undefined;
  }
};
