import type { Device } from "#shared/models/auth/Device";
import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { getDeviceId } from "@@/server/services/auth/getDeviceId";

export const getIsSameDevice = (device: Device, { session, user }: GetSessionPayload) =>
  getDeviceId(device) === getDeviceId({ sessionId: session.id, userId: user.id });
