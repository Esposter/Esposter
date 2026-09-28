import type { DevicesCommandOptions } from "#src/models/device/DevicesCommandOptions";

import { HandshakeMessageType } from "#src/models/handshake/HandshakeMessageType";
import { readDevices } from "#src/services/device/readDevices";
import { writeDevices } from "#src/services/device/writeDevices";
import { sendToRunningHost } from "#src/services/server/sendToRunningHost";

// `devices` lists every paired page; `devices --revoke <id>` removes one, and a host running now closes its socket at
// Once. A host that is not running refuses it on its next connect all the same, since it reads the list on every one
export const runDevicesCommand = async (
  { hostKey, hostname, port, revokeDeviceId, stateDirectory }: DevicesCommandOptions,
  writeLine: (line: string) => void,
): Promise<boolean> => {
  const devices = readDevices(stateDirectory);
  if (!revokeDeviceId) {
    if (devices.length === 0) writeLine("No page is connected to this host.");
    for (const { createdAt, id, name, origin } of devices)
      writeLine(`${id}  ${name}  ${origin}  since ${createdAt.toISOString()}`);
    return true;
  }

  if (!devices.some(({ id }) => id === revokeDeviceId)) {
    writeLine(`No device has the id ${revokeDeviceId}.`);
    return false;
  }

  writeDevices(
    stateDirectory,
    devices.filter(({ id }) => id !== revokeDeviceId),
  );
  await sendToRunningHost(hostname, port, hostKey, (signature) => ({
    deviceId: revokeDeviceId,
    signature,
    type: HandshakeMessageType.Revoke,
  }));
  writeLine(`Removed ${revokeDeviceId}. It has to connect again to use this host.`);
  return true;
};
