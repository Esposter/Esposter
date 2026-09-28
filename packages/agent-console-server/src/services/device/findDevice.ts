import type { Device } from "#src/models/device/Device";

import { hashCredential } from "#src/services/device/hashCredential";
import { checkIsTokenValid } from "#src/services/server/checkIsTokenValid";

// The device a credential belongs to, its hash compared in constant time
export const findDevice = (devices: Device[], credential: string): Device | undefined => {
  const credentialHash = hashCredential(credential);
  return devices.find((device) => checkIsTokenValid(credentialHash, device.credentialHash));
};
