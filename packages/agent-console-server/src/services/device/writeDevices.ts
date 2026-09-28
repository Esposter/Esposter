import type { Device } from "#src/models/device/Device";

import { DEVICES_FILENAME } from "#src/services/device/constants";
import { writeStateFile } from "#src/services/device/writeStateFile";

export const writeDevices = (stateDirectory: string, devices: Device[]): void => {
  writeStateFile(stateDirectory, DEVICES_FILENAME, JSON.stringify(devices, undefined, 2));
};
