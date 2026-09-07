import type { Device } from "#shared/models/auth/Device";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { getDevice } from "@@/server/services/auth/getDevice";
import { getDeviceId } from "@@/server/services/auth/getDeviceId";

export const checkIsSameDevice = (device: Device, getSessionPayload: GetSessionPayload) =>
  getDeviceId(device) === getDeviceId(getDevice(getSessionPayload));
