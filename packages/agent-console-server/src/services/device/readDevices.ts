import type { Device } from "#src/models/device/Device";

import { deviceSchema } from "#src/models/device/Device";
import { DEVICES_FILENAME } from "#src/services/device/constants";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

// Read on every use rather than held, so a device revoked by `devices --revoke` from another process is refused on
// Its next connect without the host being told
export const readDevices = (stateDirectory: string): Device[] => {
  const devicesPath = join(stateDirectory, DEVICES_FILENAME);
  if (!existsSync(devicesPath)) return [];
  // oxlint-disable-next-line no-restricted-properties -- the device schema validates the file and coerces its dates, the pair /docs/architecture/serialization.md names
  return z.array(deviceSchema).parse(JSON.parse(readFileSync(devicesPath, "utf8")));
};
